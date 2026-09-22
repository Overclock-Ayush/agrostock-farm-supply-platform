package com.ayush.agrostock.dto;

import com.ayush.agrostock.domain.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class OrderDtos {
    private OrderDtos() {}

    public record CreateOrderItemRequest(
            @NotBlank String productId,
            @Min(1) Integer quantity
    ) {}

    public record ShippingAddressRequest(
            @NotBlank @Size(max = 160) String line1,
            @NotBlank @Size(max = 80) String city,
            @NotBlank @Size(max = 80) String state,
            @NotBlank @Size(max = 16) String postalCode,
            @NotBlank @Size(max = 60) String country
    ) {}

    public record CreateOrderRequest(
            @NotEmpty @Valid List<CreateOrderItemRequest> items,
            @Valid ShippingAddressRequest shippingAddress
    ) {}

    public record OrderItemResponse(
            String productId,
            String productName,
            String sku,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal
    ) {}

    public record OrderResponse(
            String id,
            String buyerEmail,
            List<OrderItemResponse> items,
            BigDecimal subtotal,
            BigDecimal shippingFee,
            BigDecimal total,
            ShippingAddressRequest shippingAddress,
            OrderStatus status,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record StatusUpdateRequest(OrderStatus status) {}
}
