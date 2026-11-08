package com.goeFast.GeoFastPe.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "emergency_reports")
public class EmergencyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(name = "emergency_type", nullable = false, length = 40)
    private String type;

    @Column(nullable = false, length = 10)
    private String urgency;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "location_text", length = 200)
    private String locationText;

    private Double lat;

    private Double lng;

    @Column(nullable = false, length = 20)
    private String status = "Registrada";

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "emergency_report_images", joinColumns = @JoinColumn(name = "emergency_report_id"))
    @Column(name = "image", length = 500)
    private List<String> images = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

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
