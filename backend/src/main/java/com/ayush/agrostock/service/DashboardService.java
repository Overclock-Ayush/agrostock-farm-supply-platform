package com.ayush.agrostock.service;

import com.ayush.agrostock.domain.OrderStatus;
import com.ayush.agrostock.dto.DashboardDtos;
import com.ayush.agrostock.model.Product;
import com.ayush.agrostock.repository.OrderRepository;
import com.ayush.agrostock.repository.ProductRepository;
import org.bson.Document;
import org.bson.types.Decimal128;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.Map;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final MongoTemplate mongoTemplate;

    public DashboardService(ProductRepository productRepository,
                            OrderRepository orderRepository,
                            MongoTemplate mongoTemplate) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public DashboardDtos.DashboardResponse getStats() {
        long totalProducts = productRepository.count();

        long lowStock = productRepository.findAll().stream()
                .filter(Product::isActive)
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() <= 10)
                .count();

        long totalOrders = orderRepository.count();

        BigDecimal revenue = calculateRevenue();

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

    private BigDecimal calculateRevenue() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(
                        Criteria.where("status").ne("CANCELLED")
                ),
                Aggregation.group()
                        .sum("total")
                        .as("revenue")
        );

        Document result = mongoTemplate.aggregate(
                aggregation,
                "orders",
                Document.class
        ).getUniqueMappedResult();

        if (result == null) {
            return BigDecimal.ZERO;
        }

        Object rawRevenue = result.get("revenue");

        if (rawRevenue instanceof Decimal128 decimal128) {
            return decimal128.bigDecimalValue();
        }

        if (rawRevenue instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }

        if (rawRevenue != null) {
            try {
                return new BigDecimal(rawRevenue.toString());
            } catch (NumberFormatException ignored) {
                // Fall through to zero if Mongo returns an unexpected type.
            }
        }

        return BigDecimal.ZERO;
    }
}