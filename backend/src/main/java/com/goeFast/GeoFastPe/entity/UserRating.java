package com.goeFast.GeoFastPe.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "user_ratings", uniqueConstraints = @UniqueConstraint(columnNames = {"reviewer_id", "reviewed_id", "service_id"}))
public class UserRating {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "reviewed_id", nullable = false)
    private User reviewed;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "service_id")
    private ServiceListing service;
    @Column(nullable = false) private int rating;
    @Column(length = 500) private String comment;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;

    @PrePersist void onCreate() { createdAt = Instant.now(); }
}
