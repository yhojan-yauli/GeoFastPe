package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.CommunityEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityEventRepository extends JpaRepository<CommunityEvent, Long> {

    List<CommunityEvent> findAllByOwnerId(Long ownerId);
}

