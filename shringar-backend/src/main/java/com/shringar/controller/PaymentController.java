package com.shringar.controller;

import com.shringar.dto.request.VerifyPaymentRequest;
import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.PaymentOrderResponse;
import com.shringar.security.CurrentUserResolver;
import com.shringar.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final CurrentUserResolver currentUser;

    /**
     * POST /api/payments/advance-order/{bookingId}
     * Frontend calls this first, then opens Razorpay Checkout with the returned order id.
     */
    @PostMapping("/advance-order/{bookingId}")
    public ApiResponse<PaymentOrderResponse> createAdvanceOrder(@PathVariable Long bookingId) {
        PaymentOrderResponse order = paymentService.createAdvanceOrder(currentUser.getCurrentUserId(), bookingId);
        return ApiResponse.success("Razorpay order created", order);
    }

    /**
     * POST /api/payments/verify
     * Frontend calls this in the Razorpay Checkout success handler with the
     * three values Razorpay returns (order id, payment id, signature).
     */
    @PostMapping("/verify")
    public ApiResponse<Void> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        paymentService.verifyAdvancePayment(currentUser.getCurrentUserId(), request);
        return ApiResponse.success("Payment verified — booking confirmed!", null);
    }

    /**
     * POST /api/payments/{bookingId}/mark-balance-paid?method=CASH
     * Called by the artist's app / admin panel once the remaining 70% is settled in person.
     */
    @PostMapping("/{bookingId}/mark-balance-paid")
    public ApiResponse<Void> markBalancePaid(
            @PathVariable Long bookingId,
            @RequestParam(defaultValue = "CASH") String method) {
        paymentService.markBalancePaid(bookingId, method);
        return ApiResponse.success("Balance payment recorded", null);
    }
}
