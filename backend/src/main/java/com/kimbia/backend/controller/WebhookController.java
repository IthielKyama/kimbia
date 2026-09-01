package com.kimbia.backend.controller;

import com.kimbia.backend.dto.tingg.TinggWebhookAckResponse;
import com.kimbia.backend.dto.tingg.TinggWebhookPayload;
import com.kimbia.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}

