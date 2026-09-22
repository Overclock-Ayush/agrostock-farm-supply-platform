package com.ayush.agrostock.repository;

import com.ayush.agrostock.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Repository
public class ProductRepositoryImpl implements ProductRepositoryCustom {
    private final MongoTemplate mongoTemplate;

    public ProductRepositoryImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Page<Product> search(String queryText, String category, Boolean active, Pageable pageable) {
        List<Criteria> conditions = new ArrayList<>();

        if (queryText != null && !queryText.isBlank()) {
            String safe = Pattern.quote(queryText.trim());
            conditions.add(new Criteria().orOperator(
                    Criteria.where("name").regex(safe, "i"),
                    Criteria.where("description").regex(safe, "i"),
                    Criteria.where("category").regex(safe, "i"),
                    Criteria.where("sku").regex(safe, "i")
            ));
        }

        if (category != null && !category.isBlank()) {
            conditions.add(Criteria.where("category").is(category));
        }

        if (active != null) {
            conditions.add(Criteria.where("active").is(active));
        }

        Query countQuery = new Query();
        Query dataQuery = new Query();
        if (!conditions.isEmpty()) {
            Criteria combined = new Criteria().andOperator(conditions.toArray(Criteria[]::new));
            countQuery.addCriteria(combined);
            dataQuery.addCriteria(combined);
        }

        long total = mongoTemplate.count(countQuery, Product.class);
        dataQuery.with(pageable);
        List<Product> items = mongoTemplate.find(dataQuery, Product.class);
        return new PageImpl<>(items, pageable, total);
    }

    @Override
    public long decrementStock(String sku, int quantity) {
        Query query = Query.query(Criteria.where("sku").is(sku).and("stockQuantity").gte(quantity));
        Update update = new Update()
                .inc("stockQuantity", -quantity)
                .set("updatedAt", Instant.now());
        return mongoTemplate.updateFirst(query, update, Product.class).getModifiedCount();
    }

    @Override
    public long incrementStock(String sku, int quantity) {
        Query query = Query.query(Criteria.where("sku").is(sku));
        Update update = new Update()
                .inc("stockQuantity", quantity)
                .set("updatedAt", Instant.now());
        return mongoTemplate.updateFirst(query, update, Product.class).getModifiedCount();
    }
}
