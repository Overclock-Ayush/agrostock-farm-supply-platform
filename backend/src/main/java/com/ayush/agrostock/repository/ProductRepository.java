package com.ayush.agrostock.repository;

import com.ayush.agrostock.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String>, ProductRepositoryCustom {
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
}
