package com.ayush.agrostock.service;

import com.ayush.agrostock.domain.OrderStatus;
import com.ayush.agrostock.dto.DashboardDtos;
import com.ayush.agrostock.model.Product;
import com.ayush.agrostock.repository.OrderRepository;
import com.ayush.agrostock.repository.ProductRepository;
import com.ayush.agrostock.repository.OrderRepository.RevenueProjection;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.Map;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public DashboardService(ProductRepository productRepository, OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public DashboardDtos.DashboardResponse getStats() {
        long totalProducts = productRepository.count();

        long lowStock = productRepository.findAll().stream()
                .filter(Product::isActive)
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() <= 10)
                .count();

        long totalOrders = orderRepository.count();

        RevenueProjection revenueResult = orderRepository.sumRevenue();

        BigDecimal revenue = revenueResult != null && revenueResult.getValue() != null
                ? revenueResult.getValue()
                : BigDecimal.ZERO;

        Map<OrderStatus, Long> byStatus = new EnumMap<>(OrderStatus.class);

        for (OrderStatus status : OrderStatus.values()) {
            byStatus.put(status, orderRepository.countByStatus(status));
        }

        return new DashboardDtos.DashboardResponse(
                totalProducts,
                lowStock,
                totalOrders,
                revenue,
                byStatus
        );
    }
}