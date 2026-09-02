package com.kimbia.backend.controller;

import com.kimbia.backend.dto.CheckoutRequest;
import com.kimbia.backend.dto.CheckoutResponse;
import com.kimbia.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request, Authentication auth) {
        try {
            CheckoutResponse response = paymentService.initiateCheckout(auth.getName(), request.getRaceId(), request.getReturnUrl());
            return ResponseEntity.ok(response);
        } catch (HttpStatusCodeException e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Tingg API Error",
                    "status", e.getStatusCode().value(),
                    "responseBody", e.getResponseBodyAsString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.getClass().getName()));
        }
    }
    @GetMapping("/simulate/{registrationId}")
    public ResponseEntity<?> simulate(@org.springframework.web.bind.annotation.PathVariable Integer registrationId) {
        try {
            // Quick local dev hack to simulate Tingg webhook
            paymentService.simulateSuccess(registrationId);
            return ResponseEntity.ok(Map.of("status", "simulated"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.toString(), "message", e.getMessage() != null ? e.getMessage() : "null"));
        }
    }
}

