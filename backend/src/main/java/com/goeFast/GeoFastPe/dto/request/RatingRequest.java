package com.goeFast.GeoFastPe.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record RatingRequest(
        Long reviewedId,
        Long serviceId,
        @Min(1) @Max(5) Integer rating,
        @Size(max = 500) String comment
) {}
