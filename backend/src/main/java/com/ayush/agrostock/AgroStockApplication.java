package com.ayush.agrostock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class AgroStockApplication {
    public static void main(String[] args) {
        SpringApplication.run(AgroStockApplication.class, args);
    }
}
