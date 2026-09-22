package com.ayush.agrostock.repository;

import com.ayush.agrostock.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductRepositoryCustom {
    Page<Product> search(String queryText, String category, Boolean active, Pageable pageable);
    long decrementStock(String sku, int quantity);
    long incrementStock(String sku, int quantity);
}
