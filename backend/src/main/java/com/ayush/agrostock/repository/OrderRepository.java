package com.ayush.agrostock.repository;

import com.ayush.agrostock.domain.OrderStatus;
import com.ayush.agrostock.model.CustomerOrder;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends MongoRepository<CustomerOrder, String> {

    List<CustomerOrder> findByBuyerIdOrderByCreatedAtDesc(String buyerId);

    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    long countByStatus(OrderStatus status);

    @Aggregation(pipeline = {
            "{ $match: { status: { $ne: 'CANCELLED' } } }",
            "{ $group: { _id: null, value: { $sum: '$total' } } }"
    })
    RevenueProjection sumRevenue();

    interface RevenueProjection {
        BigDecimal getValue();
    }
}