package com.ayush.agrostock.service;

import com.ayush.agrostock.domain.OrderStatus;
import com.ayush.agrostock.dto.DashboardDtos;
import com.ayush.agrostock.model.Product;
import com.ayush.agrostock.repository.OrderRepository;
import com.ayush.agrostock.repository.ProductRepository;
import org.bson.Document;
import org.bson.types.Decimal128;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
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
        List<Document> pipeline = List.of(
                new Document("$match",
                        new Document("status",
                                new Document("$ne", "CANCELLED"))),

                new Document("$group",
                        new Document("_id", null)
                                .append("revenue",
                                        new Document("$sum",
                                                new Document("$toDecimal", "$total"))))
        );

        Document result = mongoTemplate
                .getCollection("orders")
                .aggregate(pipeline)
                .first();

        if (result == null) {
            return BigDecimal.ZERO;
        }

        Object revenue = result.get("revenue");

        if (revenue instanceof Decimal128 decimal128) {
            return decimal128.bigDecimalValue();
        }

        if (revenue instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }

        if (revenue instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }

        if (revenue != null) {
            try {
                return new BigDecimal(revenue.toString());
            } catch (NumberFormatException ignored) {
                // Return zero for unexpected MongoDB value types.
            }
        }

        return BigDecimal.ZERO;
    }
}