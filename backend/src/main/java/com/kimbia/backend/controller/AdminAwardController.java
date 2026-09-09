package com.kimbia.backend.controller;

import com.kimbia.backend.dto.AwardPayoutRequest;
import com.kimbia.backend.entity.Payment;
import com.kimbia.backend.enums.AwardType;
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
    public ResponseEntity<?> getAwardPayments(
            @RequestParam(name = "race_id", required = false) Integer raceId,
            @RequestParam(name = "raceId", required = false) Integer raceIdFallback,
            @RequestParam(name = "award_type", required = false) String awardType,
            @RequestParam(name = "awardType", required = false) String awardTypeFallback,
            Authentication auth
    ) {
        try {
            Integer targetRaceId = raceId != null ? raceId : raceIdFallback;
            String rawAwardType = awardType != null ? awardType : awardTypeFallback;
            AwardType targetAwardType = null;
            if (rawAwardType != null && !rawAwardType.isBlank() && !"ALL".equalsIgnoreCase(rawAwardType.trim())) {
                try {
                    targetAwardType = AwardType.fromString(rawAwardType);
                } catch (Exception e) {
                    log.warn("Invalid award type filter: {}", rawAwardType);
                }
            }
            return ResponseEntity.ok(paymentService.getAwardPayments(targetRaceId, targetAwardType, auth));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching award payments: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}
