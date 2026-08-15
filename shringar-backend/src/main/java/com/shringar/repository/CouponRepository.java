package com.shringar.repository;

import com.shringar.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);
    Optional<Coupon> findByCodeIgnoreCase(String code);
    List<Coupon> findByIsActiveTrueOrderByCreatedAtDesc();
    List<Coupon> findAllByOrderByCreatedAtDesc();
    boolean existsByCode(String code);
}
