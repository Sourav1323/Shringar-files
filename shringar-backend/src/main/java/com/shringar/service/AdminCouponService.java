package com.shringar.service;

import com.shringar.exception.BadRequestException;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.Coupon;
import com.shringar.model.enums.CouponType;
import com.shringar.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AdminCouponService {

    private final CouponRepository couponRepository;
    private static final Random RANDOM = new Random();

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc();
    }

    /** Returns only currently active & valid coupons — safe to show on the public site */
    public List<Coupon> getPublicCoupons() {
        return couponRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream().filter(Coupon::isCurrentlyValid).toList();
    }

    @Transactional
    public Coupon createCoupon(Map<String, Object> data) {
        String code = data.containsKey("code")
                ? ((String) data.get("code")).toUpperCase().trim()
                : generateCode();

        if (couponRepository.existsByCode(code)) {
            throw new BadRequestException("Coupon code '" + code + "' already exists.");
        }

        CouponType type = CouponType.valueOf(
                ((String) data.getOrDefault("type", "PERCENT")).toUpperCase());

        BigDecimal value = new BigDecimal(data.getOrDefault("value", "10").toString());
        if (value.compareTo(BigDecimal.ZERO) <= 0)
            throw new BadRequestException("Coupon value must be greater than zero.");

        if (type == CouponType.PERCENT && value.compareTo(new BigDecimal("100")) > 0)
            throw new BadRequestException("Percentage discount cannot exceed 100%.");

        Coupon coupon = Coupon.builder()
                .code(code)
                .type(type)
                .value(value)
                .minOrderValue(data.containsKey("minOrderValue") ? new BigDecimal(data.get("minOrderValue").toString()) : BigDecimal.ZERO)
                .maxDiscount(data.containsKey("maxDiscount") ? new BigDecimal(data.get("maxDiscount").toString()) : null)
                .description((String) data.getOrDefault("description", code + " discount"))
                .usageLimit(data.containsKey("usageLimit") ? ((Number) data.get("usageLimit")).intValue() : null)
                .validFrom(LocalDateTime.now())
                .validUntil(data.containsKey("validDays")
                        ? LocalDateTime.now().plusDays(((Number) data.get("validDays")).longValue())
                        : LocalDateTime.now().plusYears(1))
                .isActive(true)
                .build();

        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon toggleActive(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setIsActive(!coupon.getIsActive());
        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        couponRepository.deleteById(id);
    }

    private String generateCode() {
        String[] prefixes = {"SHRINGAR", "BRIDAL", "MEHENDI", "HENNA", "FESTIVE", "SAVE"};
        String prefix = prefixes[RANDOM.nextInt(prefixes.length)];
        int suffix = 10 + RANDOM.nextInt(90);
        return prefix + suffix;
    }
}
