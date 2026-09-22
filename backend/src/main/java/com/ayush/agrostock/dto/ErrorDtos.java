package com.ayush.agrostock.dto;

import java.time.Instant;
import java.util.Map;

public final class ErrorDtos {
    private ErrorDtos() {}

    public record ApiError(
            Instant timestamp,
            int status,
            String error,
            String message,
            String path,
            Map<String, String> validationErrors
    ) {}
}
