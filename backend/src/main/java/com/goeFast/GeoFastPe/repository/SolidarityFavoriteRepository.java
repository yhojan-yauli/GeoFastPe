package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.SolidarityFavorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SolidarityFavoriteRepository extends JpaRepository<SolidarityFavorite, Long> {

    Optional<SolidarityFavorite> findByUserIdAndPostId(Long userId, Long postId);

    boolean existsByUserIdAndPostId(Long userId, Long postId);

    List<SolidarityFavorite> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    List<SolidarityFavorite> findAllByPostId(Long postId);
}

