package com.ayush.agrostock.config;

import com.ayush.agrostock.domain.Role;
import com.ayush.agrostock.model.AppUser;
import com.ayush.agrostock.model.Product;
import com.ayush.agrostock.repository.ProductRepository;
import com.ayush.agrostock.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedDemoData(UserRepository userRepository,
                                   ProductRepository productRepository,
                                   PasswordEncoder passwordEncoder,
                                   @Value("${app.seed-demo-data:true}") boolean seedDemoData) {
        return args -> {
            if (!seedDemoData) return;

            if (!userRepository.existsByEmailIgnoreCase("admin@agrostock.dev")) {
                userRepository.save(AppUser.builder()
                        .name("AgroStock Admin")
                        .email("admin@agrostock.dev")
                        .passwordHash(passwordEncoder.encode("Admin@123"))
                        .role(Role.ADMIN)
                        .build());
            }

            if (!userRepository.existsByEmailIgnoreCase("buyer@agrostock.dev")) {
                userRepository.save(AppUser.builder()
                        .name("Demo Buyer")
                        .email("buyer@agrostock.dev")
                        .passwordHash(passwordEncoder.encode("Buyer@123"))
                        .role(Role.BUYER)
                        .build());
            }

            if (productRepository.count() == 0) {
                productRepository.saveAll(List.of(
                        product("Organic Tomato Seeds", "High-germination tomato seeds for greenhouse and open-field farming.", "Seeds", "SEED-TOM-001", "249.00", 45, "pack", "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=900&q=80"),
                        product("Hybrid Maize Seeds", "Reliable hybrid maize seeds designed for strong field performance.", "Seeds", "SEED-MAI-002", "389.00", 30, "pack", "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80"),
                        product("Neem-Based Bio Fertilizer", "Eco-friendly soil nutrition support for sustainable crop production.", "Fertilizers", "FERT-NEE-003", "599.00", 18, "kg", "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=900&q=80"),
                        product("Drip Irrigation Starter Kit", "Starter kit for precise water delivery in small farms and kitchen gardens.", "Irrigation", "IRR-DRP-004", "1499.00", 12, "kit", "https://images.unsplash.com/photo-1592982537447-6f7c1a1e1a12?auto=format&fit=crop&w=900&q=80"),
                        product("Soil Moisture Sensor", "Compact sensor for monitoring field moisture and improving irrigation decisions.", "Smart Farming", "IOT-MOI-005", "1199.00", 9, "unit", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80"),
                        product("Hand Seed Planter", "Manual precision planter suitable for row crops and nursery operations.", "Farm Tools", "TOOL-PLN-006", "799.00", 14, "unit", "https://images.unsplash.com/photo-1599685315640-8f9b2e9a1e4f?auto=format&fit=crop&w=900&q=80")
                ));
            }
        };
    }

    private Product product(String name, String description, String category, String sku,
                            String price, int stock, String unit, String imageUrl) {
        return Product.builder()
                .name(name)
                .description(description)
                .category(category)
                .sku(sku)
                .price(new BigDecimal(price))
                .stockQuantity(stock)
                .unit(unit)
                .imageUrl(imageUrl)
                .active(true)
                .build();
    }
}
