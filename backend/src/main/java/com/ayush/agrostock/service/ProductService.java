package com.ayush.agrostock.service;

import com.ayush.agrostock.dto.ProductDtos;
import com.ayush.agrostock.exception.BadRequestException;
import com.ayush.agrostock.exception.ResourceNotFoundException;
import com.ayush.agrostock.model.Product;
import com.ayush.agrostock.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<ProductDtos.ProductResponse> search(String query, String category, Pageable pageable) {
        return searchInternal(query, category, true, pageable);
    }

    public Page<ProductDtos.ProductResponse> searchAll(String query, String category, Pageable pageable) {
        return searchInternal(query, category, null, pageable);
    }

    private Page<ProductDtos.ProductResponse> searchInternal(String query, String category, Boolean active, Pageable pageable) {
        return productRepository.search(query, category, active, pageable).map(this::toResponse);
    }


    public ProductDtos.ProductResponse getById(String id) {
        return toResponse(productRepository.findById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found.")));
    }

    public ProductDtos.ProductResponse create(ProductDtos.ProductRequest request) {
        String sku = request.sku().trim().toUpperCase();
        if (productRepository.existsBySku(sku)) {
            throw new BadRequestException("SKU already exists.");
        }
        Product product = Product.builder()
                .name(request.name().trim())
                .description(request.description().trim())
                .category(request.category().trim())
                .sku(sku)
                .price(request.price())
                .stockQuantity(request.stockQuantity())
                .unit(request.unit().trim())
                .imageUrl(blankToNull(request.imageUrl()))
                .active(request.active() == null || request.active())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return toResponse(productRepository.save(product));
    }

    @CacheEvict(cacheNames = "products", key = "#id")
    public ProductDtos.ProductResponse update(String id, ProductDtos.ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found."));

        String sku = request.sku().trim().toUpperCase();
        if (!sku.equals(product.getSku()) && productRepository.existsBySku(sku)) {
            throw new BadRequestException("SKU already exists.");
        }

        product.setName(request.name().trim());
        product.setDescription(request.description().trim());
        product.setCategory(request.category().trim());
        product.setSku(sku);
        product.setPrice(request.price());
        product.setStockQuantity(request.stockQuantity());
        product.setUnit(request.unit().trim());
        product.setImageUrl(blankToNull(request.imageUrl()));
        product.setActive(request.active() == null || request.active());
        product.setUpdatedAt(Instant.now());

        return toResponse(productRepository.save(product));
    }

    @CacheEvict(cacheNames = "products", key = "#id")
    public void delete(String id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found.");
        }
        productRepository.deleteById(id);
    }

    public Product getRequired(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found."));
    }

    public ProductDtos.ProductResponse toResponse(Product p) {
        return new ProductDtos.ProductResponse(
                p.getId(), p.getName(), p.getDescription(), p.getCategory(), p.getSku(),
                p.getPrice(), p.getStockQuantity(), p.getUnit(), p.getImageUrl(), p.isActive(),
                p.getCreatedAt(), p.getUpdatedAt()
        );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}