package com.goeFast.GeoFastPe.dto.response;

import com.goeFast.GeoFastPe.entity.SaleItem;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;

@Schema(description = "Producto de Ventas Locales.")
public record SaleResponse(
        Long id,
        Long ownerId,
        String ownerName,
        String name,
        String category,
        String condition,
        BigDecimal price,
        String description,
        String location,
        String image,
        String status,
        Instant createdAt,
        Instant updatedAt
) {

    public static SaleResponse from(SaleItem s) {
        return new SaleResponse(
                s.getId(), s.getOwner().getId(), s.getOwner().getName(),
                s.getName(), s.getCategory(), s.getCondition(), s.getPrice(), s.getDescription(),
                s.getLocation(), s.getImage(), s.getStatus(), s.getCreatedAt(), s.getUpdatedAt()
        );
    }
}
