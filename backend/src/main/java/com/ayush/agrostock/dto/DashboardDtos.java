package com.ayush.agrostock.dto;

import com.ayush.agrostock.domain.OrderStatus;

import java.math.BigDecimal;
import java.util.Map;

public final class DashboardDtos {
    private DashboardDtos() {}

    public record DashboardResponse(
            long totalProducts,
            long lowStockProducts,
            long totalOrders,
            BigDecimal revenue,
            Map<OrderStatus, Long> ordersByStatus
    ) {}
}
