package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.CitizenReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CitizenReportRepository extends JpaRepository<CitizenReport, Long> {

    List<CitizenReport> findAllByOrderByCreatedAtDesc();

    List<CitizenReport> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);
}

