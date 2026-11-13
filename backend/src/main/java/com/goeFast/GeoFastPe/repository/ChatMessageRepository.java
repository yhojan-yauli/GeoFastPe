package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findAllByConversationIdOrderByCreatedAtAsc(Long conversationId);

    Optional<ChatMessage> findTopByConversationIdOrderByCreatedAtDesc(Long conversationId);
}

