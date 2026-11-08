package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.SolidarityPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolidarityPostRepository extends JpaRepository<SolidarityPost, Long> {

    List<SolidarityPost> findAllByOrderByCreatedAtDesc();

    List<SolidarityPost> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select p from SolidarityPost p where p.id = :id")
    java.util.Optional<SolidarityPost> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id);

    List<SolidarityPost> findAllByVoluntarioIdOrderByCreatedAtDesc(Long voluntarioId);

    long countByOwnerIdAndTipo(Long ownerId, String tipo);
}

