package com.goeFast.GeoFastPe.service;

import com.goeFast.GeoFastPe.dto.request.RatingRequest;
import com.goeFast.GeoFastPe.dto.response.RatingResponse;
import com.goeFast.GeoFastPe.entity.ServiceListing;
import com.goeFast.GeoFastPe.entity.UserRating;
import com.goeFast.GeoFastPe.exception.ApiException;
import com.goeFast.GeoFastPe.repository.ServiceListingRepository;
import com.goeFast.GeoFastPe.repository.UserRatingRepository;
import com.goeFast.GeoFastPe.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class RatingService {
    private final UserRatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final ServiceListingRepository serviceRepository;
    public RatingService(UserRatingRepository ratingRepository, UserRepository userRepository, ServiceListingRepository serviceRepository) {
        this.ratingRepository = ratingRepository; this.userRepository = userRepository; this.serviceRepository = serviceRepository;
    }
    @Transactional
    public RatingResponse crear(Long reviewerId, RatingRequest request) {
        if (request.reviewedId() == null || request.rating() == null) throw new ApiException(HttpStatus.BAD_REQUEST, "RATING_REQUIRED", "Indica el usuario y la calificación.");
        if (reviewerId.equals(request.reviewedId())) throw new ApiException(HttpStatus.BAD_REQUEST, "SELF_RATING", "No puedes reseñarte a ti mismo.");
        var reviewed = userRepository.findById(request.reviewedId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Usuario no encontrado."));
        ServiceListing service = null;
        if (request.serviceId() != null) service = serviceRepository.findById(request.serviceId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND", "Servicio no encontrado."));
        var existing = ratingRepository.findByReviewerIdAndReviewedIdAndServiceId(reviewerId, request.reviewedId(), request.serviceId());
        UserRating rating = existing.orElseGet(UserRating::new);
        rating.setReviewer(userRepository.getReferenceById(reviewerId)); rating.setReviewed(reviewed); rating.setService(service); rating.setRating(request.rating()); rating.setComment(request.comment() == null ? null : request.comment().trim());
        return RatingResponse.from(ratingRepository.save(rating));
    }
    @Transactional(readOnly = true)
    public List<RatingResponse> listar(Long reviewedId, Long serviceId) {
        return (serviceId == null ? ratingRepository.findAllByReviewedIdOrderByCreatedAtDesc(reviewedId) : ratingRepository.findAllByReviewedIdAndServiceIdOrderByCreatedAtDesc(reviewedId, serviceId)).stream().map(RatingResponse::from).toList();
    }
}
