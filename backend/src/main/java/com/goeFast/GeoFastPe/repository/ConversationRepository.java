package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
}

