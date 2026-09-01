package com.kimbia.backend.service;

import com.kimbia.backend.dto.tingg.TinggAuthRequest;
import com.kimbia.backend.dto.tingg.TinggAuthResponse;
import com.kimbia.backend.dto.tingg.TinggCheckoutPayload;
import com.kimbia.backend.dto.tingg.TinggCheckoutResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TinggService {

    @Value("${tingg.base-url}")
    private String baseUrl;
    @Value("${tingg.client-id}")
    private String clientId;
    @Value("${tingg.client-secret}")
    private String clientSecret;
    @Value("${tingg.service-code}")
    private String serviceCode;
    @Value("${tingg.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getCheckoutUrl(TinggCheckoutPayload payload) {
        // Get Auth Token
        String token = getAccessToken();

        // Generate Checkout URL
        payload.setService_code(serviceCode);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.set("apiKey", apiKey);
        headers.set("Content-Type", "application/json");

        HttpEntity<TinggCheckoutPayload> request = new HttpEntity<>(payload, headers);
        String url = baseUrl + "/v3/checkout-api/checkout-request/express-request";

        ResponseEntity<TinggCheckoutResponse> response = restTemplate.exchange(url, HttpMethod.POST, request, TinggCheckoutResponse.class);

        if (response.getBody() != null && response.getBody().getResults() != null) {
            return response.getBody().getResults().getShort_url();
        }
        throw new RuntimeException("Failed to get checkout URL from Tingg");
    }

    private String getAccessToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apiKey", apiKey);
        headers.set("Content-Type", "application/json");

        TinggAuthRequest authRequest = new TinggAuthRequest(clientId, clientSecret, "client_credentials");
        HttpEntity<TinggAuthRequest> request = new HttpEntity<>(authRequest, headers);

        String url = baseUrl + "/v1/oauth/token/request";
        ResponseEntity<TinggAuthResponse> response = restTemplate.exchange(url, HttpMethod.POST, request, TinggAuthResponse.class);

        if (response.getBody() != null) {
            return response.getBody().getAccess_token();
        }
        throw new RuntimeException("Failed to authenticate with Tingg");
    }
}

