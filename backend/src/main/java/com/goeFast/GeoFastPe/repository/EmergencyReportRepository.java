package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.EmergencyReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmergencyReportRepository extends JpaRepository<EmergencyReport, Long> {

    List<EmergencyReport> findAllByOrderByCreatedAtDesc();

    List<EmergencyReport> findAllByReporterIdOrderByCreatedAtDesc(Long reporterId);
}

