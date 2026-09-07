package com.kimbia.backend.controller;

import com.kimbia.backend.dto.tingg.TinggPayoutCallbackPayload;
import com.kimbia.backend.dto.tingg.TinggWebhookAckResponse;
import com.kimbia.backend.dto.tingg.TinggWebhookPayload;
import com.kimbia.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private final PaymentService paymentService;

    public WebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/tingg")
    public ResponseEntity<TinggWebhookAckResponse> handleTinggWebhook(@RequestBody TinggWebhookPayload payload) {
        TinggWebhookAckResponse response = paymentService.processWebhook(payload, null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tingg/payout-callback")
    public ResponseEntity<?> handleTinggPayoutCallback(
            @RequestBody TinggPayoutCallbackPayload payload,
            @RequestHeader(name = "X-Tingg-Signature", required = false) String signature
    ) {
        try {
            Map<String, Object> ack = paymentService.handlePayoutCallback(payload, null);
            return ResponseEntity.ok(ack);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

