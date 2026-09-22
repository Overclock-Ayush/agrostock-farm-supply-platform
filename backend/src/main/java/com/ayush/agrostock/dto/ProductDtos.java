package com.ayush.agrostock.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public final class ProductDtos {
    private ProductDtos() {}

    public record ProductRequest(
            @NotBlank @Size(max = 120) String name,
            @NotBlank @Size(max = 500) String description,
            @NotBlank @Size(max = 60) String category,
            @NotBlank @Size(max = 40) String sku,
            @NotNull @DecimalMin(value = "0.01") BigDecimal price,
            @NotNull @Min(0) Integer stockQuantity,
            @NotBlank @Size(max = 30) String unit,
            @Size(max = 600) String imageUrl,
            Boolean active
    ) {}

    public record ProductResponse(
            String id,
            String name,
            String description,
            String category,
            String sku,
            BigDecimal price,
            Integer stockQuantity,
            String unit,
            String imageUrl,
            boolean active,
            Instant createdAt,
            Instant updatedAt
    ) {}
}
