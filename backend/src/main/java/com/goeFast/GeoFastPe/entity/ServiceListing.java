package com.goeFast.GeoFastPe.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "service_listings")
public class ServiceListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 40)
    private String category;

    @Column(name = "service_type", nullable = false, length = 60)
    private String type;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, length = 9)
    private String phone;

    @Column(name = "location_type", nullable = false, length = 10)
    private String locationType;

    @Column(length = 200)
    private String address;

    private Double latitude;

    private Double longitude;

    @Column(nullable = false, length = 20)
    private String availability;

    @Column(length = 500)
    private String image;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(nullable=false, columnDefinition="double precision default 0")
    private double rating;
    @Column(nullable=false, columnDefinition="bigint default 0")
    private long recommendationCount;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
