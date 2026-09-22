package com.ayush.agrostock.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddress {
    private String line1;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}
