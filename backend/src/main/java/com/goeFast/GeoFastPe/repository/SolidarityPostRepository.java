package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.SolidarityPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolidarityPostRepository extends JpaRepository<SolidarityPost, Long> {

    List<SolidarityPost> findAllByOrderByCreatedAtDesc();

    List<SolidarityPost> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    long countByOwnerIdAndTipo(Long ownerId, String tipo);
}

