package com.shringar.controller;

import com.shringar.dto.request.AddToCartRequest;
import com.shringar.dto.request.ApplyCouponRequest;
import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.CartResponse;
import com.shringar.security.CurrentUserResolver;
import com.shringar.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final CurrentUserResolver currentUser;

    /** GET /api/cart */
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(currentUser.getCurrentUserId())));
    }

    /** POST /api/cart/items */
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(@Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addToCart(currentUser.getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Added to cart", cart));
    }

    /** DELETE /api/cart/items/{cartItemId} */
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(@PathVariable Long cartItemId) {
        CartResponse cart = cartService.removeFromCart(currentUser.getCurrentUserId(), cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Removed from cart", cart));
    }

    /** POST /api/cart/coupon */
    @PostMapping("/coupon")
    public ResponseEntity<ApiResponse<CartResponse>> applyCoupon(@Valid @RequestBody ApplyCouponRequest request) {
        CartResponse cart = cartService.applyCoupon(currentUser.getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Coupon applied", cart));
    }

    /** DELETE /api/cart/coupon */
    @DeleteMapping("/coupon")
    public ResponseEntity<ApiResponse<CartResponse>> removeCoupon() {
        CartResponse cart = cartService.removeCoupon(currentUser.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success("Coupon removed", cart));
    }

    /** DELETE /api/cart */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        cartService.clearCart(currentUser.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
