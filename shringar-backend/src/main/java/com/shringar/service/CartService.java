package com.shringar.service;

import com.shringar.dto.request.AddToCartRequest;
import com.shringar.dto.request.ApplyCouponRequest;
import com.shringar.dto.response.CartItemResponse;
import com.shringar.dto.response.CartResponse;
import com.shringar.exception.BadRequestException;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.*;
import com.shringar.model.enums.CouponType;
import com.shringar.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final DesignRepository designRepository;
    private final CouponRepository couponRepository;

    private static final BigDecimal ARTIST_VISIT_FEE = new BigDecimal("200.00");
    private static final BigDecimal ADVANCE_PERCENT = new BigDecimal("0.30");

    @Transactional
    public CartResponse addToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        Design design = designRepository.findById(request.getDesignId())
                .orElseThrow(() -> new ResourceNotFoundException("Design not found"));

        var existing = cartItemRepository.findByCartIdAndDesignId(cart.getId(), design.getId());

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + (request.getQuantity() != null ? request.getQuantity() : 1));
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .design(design)
                    .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                    .coverageNote(request.getCoverageNote())
                    .build();
            cart.getItems().add(item);
            cartItemRepository.save(item);
        }

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse removeFromCart(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(item -> item.getId().equals(cartItemId));
        cartItemRepository.deleteById(cartItemId);

        // re-validate coupon minimum after removal
        revalidateCoupon(cart);

        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse applyCoupon(Long userId, ApplyCouponRequest request) {
        Cart cart = getOrCreateCart(userId);

        Coupon coupon = couponRepository.findByCodeIgnoreCase(request.getCode())
                .orElseThrow(() -> new BadRequestException("Invalid coupon code"));

        if (!coupon.isCurrentlyValid()) {
            throw new BadRequestException("This coupon has expired or reached its usage limit");
        }

        BigDecimal subtotal = cart.getSubtotal().add(ARTIST_VISIT_FEE);

        if (subtotal.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new BadRequestException(
                    "Minimum order of ₹" + coupon.getMinOrderValue() + " required for this coupon");
        }

        BigDecimal discount;
        if (coupon.getType() == CouponType.PERCENT) {
            discount = subtotal.multiply(coupon.getValue()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                discount = coupon.getMaxDiscount();
            }
        } else {
            discount = coupon.getValue();
        }

        cart.setAppliedCouponCode(coupon.getCode().toUpperCase());
        cart.setDiscountAmount(discount);
        cartRepository.save(cart);

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse removeCoupon(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.setAppliedCouponCode(null);
        cart.setDiscountAmount(BigDecimal.ZERO);
        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cart.setAppliedCouponCode(null);
        cart.setDiscountAmount(BigDecimal.ZERO);
        cartRepository.save(cart);
    }

    private void revalidateCoupon(Cart cart) {
        if (cart.getAppliedCouponCode() == null) return;

        couponRepository.findByCodeIgnoreCase(cart.getAppliedCouponCode()).ifPresent(coupon -> {
            BigDecimal subtotal = cart.getSubtotal().add(ARTIST_VISIT_FEE);
            if (subtotal.compareTo(coupon.getMinOrderValue()) < 0) {
                cart.setAppliedCouponCode(null);
                cart.setDiscountAmount(BigDecimal.ZERO);
            }
        });
    }

    private final UserRepository userRepository;

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    return cartRepository.save(Cart.builder().user(user).build());
                });
    }

    private CartResponse buildCartResponse(Cart cart) {
        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal total = subtotal.add(ARTIST_VISIT_FEE)
                .subtract(cart.getDiscountAmount() != null ? cart.getDiscountAmount() : BigDecimal.ZERO);
        BigDecimal advance = total.multiply(ADVANCE_PERCENT).setScale(0, RoundingMode.CEILING);
        BigDecimal balance = total.subtract(advance);

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(cart.getItems().stream().map(this::toItemResponse).toList())
                .itemCount(cart.getItemCount())
                .subtotal(subtotal)
                .artistVisitFee(ARTIST_VISIT_FEE)
                .appliedCouponCode(cart.getAppliedCouponCode())
                .discountAmount(cart.getDiscountAmount())
                .total(total)
                .advanceAmount(advance)
                .balanceAmount(balance)
                .build();
    }

    private CartItemResponse toItemResponse(CartItem item) {
        Design d = item.getDesign();
        return CartItemResponse.builder()
                .cartItemId(item.getId())
                .designId(d.getId())
                .designName(d.getName())
                .emojiIcon(d.getEmojiIcon())
                .coverage(d.getCoverage())
                .durationLabel(d.getDurationLabel())
                .conesNeeded(d.getConesNeeded())
                .price(d.getPrice())
                .quantity(item.getQuantity())
                .coverageNote(item.getCoverageNote())
                .build();
    }
}
