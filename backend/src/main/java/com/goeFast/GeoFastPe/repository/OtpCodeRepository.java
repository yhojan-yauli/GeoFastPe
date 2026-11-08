package com.goeFast.GeoFastPe.repository;

import com.goeFast.GeoFastPe.entity.OtpCode;
import com.goeFast.GeoFastPe.entity.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    Optional<OtpCode> findTopByPhoneAndPurposeAndConsumedFalseOrderByCreatedAtDesc(String phone, OtpPurpose purpose);

    long countByPhoneAndCreatedAtAfter(String phone, Instant after);

    @Modifying
    @Transactional
    @Query("delete from OtpCode o where o.phone = :phone and o.purpose = :purpose and o.consumed = false")
    void deleteActive(@Param("phone") String phone, @Param("purpose") OtpPurpose purpose);
}
