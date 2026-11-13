package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.ServiceListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceListingRepository extends JpaRepository<ServiceListing, Long> {

    List<ServiceListing> findAllByOrderByCreatedAtDesc();

    List<ServiceListing> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);
}

