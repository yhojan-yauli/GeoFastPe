package com.goeFast.GeoFastPe.dto.response;

import com.goeFast.GeoFastPe.entity.UserRating;
import java.time.Instant;

public record RatingResponse(Long id, Long reviewerId, String reviewerName, Long reviewedId, Long serviceId, int rating, String comment, Instant createdAt) {
    public static RatingResponse from(UserRating r) {
        return new RatingResponse(r.getId(), r.getReviewer().getId(), r.getReviewer().getName(), r.getReviewed().getId(), r.getService() == null ? null : r.getService().getId(), r.getRating(), r.getComment(), r.getCreatedAt());
    }
}
