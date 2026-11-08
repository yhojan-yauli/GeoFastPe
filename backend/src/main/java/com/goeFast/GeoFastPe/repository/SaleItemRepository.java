package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    List<SaleItem> findAllByOrderByCreatedAtDesc();

    List<SaleItem> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);
}

