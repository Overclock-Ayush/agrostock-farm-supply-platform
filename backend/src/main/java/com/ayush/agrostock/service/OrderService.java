package com.ayush.agrostock.service;

import com.ayush.agrostock.domain.OrderStatus;
import com.ayush.agrostock.dto.OrderDtos;
import com.ayush.agrostock.exception.BadRequestException;
import com.ayush.agrostock.exception.ForbiddenException;
import com.ayush.agrostock.exception.ResourceNotFoundException;
import com.ayush.agrostock.model.AppUser;
import com.ayush.agrostock.model.CustomerOrder;
import com.ayush.agrostock.model.OrderItem;
import com.ayush.agrostock.model.Product;
import com.ayush.agrostock.model.ShippingAddress;
import com.ayush.agrostock.repository.OrderRepository;
import com.ayush.agrostock.repository.ProductRepository;
import com.ayush.agrostock.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private static final BigDecimal FLAT_SHIPPING = new BigDecimal("79.00");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderDtos.OrderResponse createOrder(String email, OrderDtos.CreateOrderRequest request) {
        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Map<String, Integer> requested = request.items().stream()
                .collect(Collectors.toMap(
                        item -> item.productId().trim(),
                        OrderDtos.CreateOrderItemRequest::quantity,
                        Integer::sum));

        if (requested.isEmpty()) {
            throw new BadRequestException("At least one item is required.");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (Map.Entry<String, Integer> entry : requested.entrySet()) {
            Product product = productRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + entry.getKey()));

            int quantity = entry.getValue();
            if (!product.isActive()) {
                throw new BadRequestException(product.getName() + " is currently unavailable.");
            }
            if (product.getStockQuantity() == null || product.getStockQuantity() < quantity) {
                throw new BadRequestException("Insufficient stock for " + product.getName() + ".");
            }

            long modified = productRepository.decrementStock(product.getSku(), quantity);
            if (modified != 1) {
                throw new BadRequestException("Stock changed while placing the order. Please retry.");
            }

            BigDecimal lineTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(quantity))
                    .setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(lineTotal);

            orderItems.add(OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .sku(product.getSku())
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .lineTotal(lineTotal)
                    .build());
        }

        BigDecimal shipping = subtotal.compareTo(new BigDecimal("1500.00")) >= 0
                ? BigDecimal.ZERO : FLAT_SHIPPING;
        BigDecimal total = subtotal.add(shipping).setScale(2, RoundingMode.HALF_UP);

        ShippingAddress address = new ShippingAddress(
                request.shippingAddress().line1().trim(),
                request.shippingAddress().city().trim(),
                request.shippingAddress().state().trim(),
                request.shippingAddress().postalCode().trim(),
                request.shippingAddress().country().trim()
        );

        CustomerOrder order = CustomerOrder.builder()
                .buyerId(user.getId())
                .buyerEmail(user.getEmail())
                .items(orderItems)
                .subtotal(subtotal.setScale(2, RoundingMode.HALF_UP))
                .shippingFee(shipping)
                .total(total)
                .shippingAddress(address)
                .status(OrderStatus.PENDING)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return toResponse(orderRepository.save(order));
    }

    public List<OrderDtos.OrderResponse> getMyOrders(String email) {
        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderDtos.OrderResponse getById(String email, String id, boolean admin) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
        if (!admin && !order.getBuyerEmail().equalsIgnoreCase(email)) {
            throw new ForbiddenException("You cannot access this order.");
        }
        return toResponse(order);
    }

    public List<OrderDtos.OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OrderDtos.OrderResponse updateStatus(String id, OrderStatus target) {
        if (target == null) {
            throw new BadRequestException("Status is required.");
        }
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
        OrderStatus current = order.getStatus();

        if (!allowedTransitions().getOrDefault(current, Set.of()).contains(target)) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + target + ".");
        }

        if (target == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                long modified = productRepository.incrementStock(item.getSku(), item.getQuantity());
                if (modified != 1) {
                    throw new BadRequestException("Unable to restore stock for SKU " + item.getSku() + ".");
                }
            }
        }

        order.setStatus(target);
        order.setUpdatedAt(Instant.now());
        return toResponse(orderRepository.save(order));
    }

    private Map<OrderStatus, Set<OrderStatus>> allowedTransitions() {
        return Map.of(
                OrderStatus.PENDING, EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
                OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.PACKED, OrderStatus.CANCELLED),
                OrderStatus.PACKED, EnumSet.of(OrderStatus.SHIPPED),
                OrderStatus.SHIPPED, EnumSet.of(OrderStatus.DELIVERED),
                OrderStatus.DELIVERED, Set.of(),
                OrderStatus.CANCELLED, Set.of()
        );
    }

    public OrderDtos.OrderResponse toResponse(CustomerOrder order) {
        List<OrderDtos.OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderDtos.OrderItemResponse(
                        item.getProductId(), item.getProductName(), item.getSku(), item.getQuantity(),
                        item.getUnitPrice(), item.getLineTotal()))
                .toList();

        ShippingAddress address = order.getShippingAddress();
        OrderDtos.ShippingAddressRequest shipping = new OrderDtos.ShippingAddressRequest(
                address.getLine1(), address.getCity(), address.getState(), address.getPostalCode(), address.getCountry());

        return new OrderDtos.OrderResponse(
                order.getId(), order.getBuyerEmail(), items, order.getSubtotal(), order.getShippingFee(),
                order.getTotal(), shipping, order.getStatus(), order.getCreatedAt(), order.getUpdatedAt());
    }
}
