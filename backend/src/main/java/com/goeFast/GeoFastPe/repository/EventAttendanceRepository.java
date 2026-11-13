package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.EventAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventAttendanceRepository extends JpaRepository<EventAttendance, Long> {

    Optional<EventAttendance> findByEventIdAndUserId(Long eventId, Long userId);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    long countByEventId(Long eventId);

    long countByUserId(Long userId);

    List<EventAttendance> findAllByUserId(Long userId);

    List<EventAttendance> findAllByEventId(Long eventId);
}

