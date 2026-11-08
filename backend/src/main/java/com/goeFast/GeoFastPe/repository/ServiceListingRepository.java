package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.ServiceListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceListingRepository extends JpaRepository<ServiceListing, Long> {

    List<ServiceListing> findAllByOrderByCreatedAtDesc();
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select s from ServiceListing s where s.id = :id")
    java.util.Optional<ServiceListing> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id);

    List<ServiceListing> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);
}

