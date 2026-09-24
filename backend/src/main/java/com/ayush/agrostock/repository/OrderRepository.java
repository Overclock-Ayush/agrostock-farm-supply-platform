package com.ayush.agrostock.repository;

import com.ayush.agrostock.domain.OrderStatus;
import com.ayush.agrostock.model.CustomerOrder;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<CustomerOrder, String> {

    List<CustomerOrder> findByBuyerIdOrderByCreatedAtDesc(String buyerId);

    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    long countByStatus(OrderStatus status);
}