package com.goeFast.GeoFastPe.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Getter @Setter @NoArgsConstructor
@Table(name="service_recommendations", uniqueConstraints=@UniqueConstraint(columnNames={"service_id","user_id"}))
public class RecomendacionServicio {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="service_id",nullable=false) private ServiceListing servicio;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User usuario;
    @Column(nullable=false) private int puntuacion;
    @Column(length=500) private String comentario;
    @Column(nullable=false) private Instant actualizadaEn = Instant.now();
}
