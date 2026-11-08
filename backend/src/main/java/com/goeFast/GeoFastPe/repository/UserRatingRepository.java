package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.UserRating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRatingRepository extends JpaRepository<UserRating, Long> {
    Optional<UserRating> findByReviewerIdAndReviewedIdAndServiceId(Long reviewerId, Long reviewedId, Long serviceId);
    List<UserRating> findAllByReviewedIdOrderByCreatedAtDesc(Long reviewedId);
    List<UserRating> findAllByReviewedIdAndServiceIdOrderByCreatedAtDesc(Long reviewedId, Long serviceId);
}
