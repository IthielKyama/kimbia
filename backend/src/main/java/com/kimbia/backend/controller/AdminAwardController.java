package com.kimbia.backend.controller;

import com.kimbia.backend.dto.AwardPayoutRequest;
import com.kimbia.backend.entity.Payment;
import com.kimbia.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/awards", "/api/admin/awards"})
@RequiredArgsConstructor
@Slf4j
public class AdminAwardController {

    private final PaymentService paymentService;

    @PostMapping("/payout")
    public ResponseEntity<?> initiatePayout(@RequestBody AwardPayoutRequest request, Authentication auth) {
        try {
            Map<String, Object> result = paymentService.processAwardPayout(request, auth);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error processing award payout: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @GetMapping("/simulate/{paymentId}")
    public ResponseEntity<?> simulatePayoutSuccess(@PathVariable Integer paymentId) {
        try {
            Payment payment = paymentService.simulatePayoutSuccess(paymentId);
            return ResponseEntity.ok(Map.of(
                    "status", "simulated",
                    "payment_id", payment.getId(),
                    "payment_status", payment.getStatus().name(),
                    "transaction_ref", payment.getTransactionRef()
            ));
        } catch (Exception e) {
            log.error("Error simulating payout success: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAwardPayments() {
        return ResponseEntity.ok(paymentService.getAwardPayments());
    }
}
