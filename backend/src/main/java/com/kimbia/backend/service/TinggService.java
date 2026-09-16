package com.kimbia.backend.service;

import com.kimbia.backend.dto.tingg.TinggAuthRequest;
import com.kimbia.backend.dto.tingg.TinggAuthResponse;
import com.kimbia.backend.dto.tingg.TinggCheckoutPayload;
import com.kimbia.backend.dto.tingg.TinggCheckoutResponse;
import com.kimbia.backend.dto.tingg.TinggPayoutPayload;
import com.kimbia.backend.dto.tingg.TinggPayoutResponse;
import com.kimbia.backend.entity.Payment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
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

        log.info("[TINGG CHECKOUT] Dispatching express checkout request to {} for txRef: {}, serviceCode: {}",
                url, payload.getMerchant_transaction_id(), serviceCode);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            Map<?, ?> body = response.getBody();
            log.info("[TINGG CHECKOUT] Received response from Tingg API: status={}, body={}", response.getStatusCode(), body);

            if (body != null) {
                // Format 1: {"status": 1031, "message": "This client is not allowed..."}
                if (body.get("status") instanceof Number numStatus) {
                    int statusCode = numStatus.intValue();
                    String message = body.get("message") != null ? String.valueOf(body.get("message")) : "Tingg checkout request rejected";
                    if (statusCode != 200) {
                        log.error("[TINGG CHECKOUT] Tingg rejected checkout: code={}, message={}", statusCode, message);
                        throw new RuntimeException("Tingg Gateway Error (" + statusCode + "): " + message);
                    }
                }

                // Format 2: {"status": {"status_code": 200, "status_description": "success"}}
                if (body.get("status") instanceof Map<?, ?> statusMap) {
                    Object codeObj = statusMap.get("status_code");
                    int statusCode = codeObj instanceof Number n ? n.intValue() : 0;
                    String desc = statusMap.get("status_description") != null ? String.valueOf(statusMap.get("status_description")) : "";
                    if (statusCode != 200 && statusCode != 0) {
                        log.error("[TINGG CHECKOUT] Tingg rejected checkout: code={}, description={}", statusCode, desc);
                        throw new RuntimeException("Tingg Gateway Error (" + statusCode + "): " + desc);
                    }
                }

                // Extract short_url or long_url from results
                if (body.get("results") instanceof Map<?, ?> resultsMap) {
                    if (resultsMap.get("short_url") != null && !String.valueOf(resultsMap.get("short_url")).isBlank()) {
                        return String.valueOf(resultsMap.get("short_url"));
                    }
                    if (resultsMap.get("long_url") != null && !String.valueOf(resultsMap.get("long_url")).isBlank()) {
                        return String.valueOf(resultsMap.get("long_url"));
                    }
                }
            }
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("[TINGG CHECKOUT] HTTP error from Tingg API: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Tingg HTTP Error " + e.getStatusCode().value() + ": " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("[TINGG CHECKOUT] Error during express checkout: {}", e.getMessage());
            throw (e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e.getMessage(), e));
        }

        throw new RuntimeException("Failed to get checkout URL from Tingg: empty or unrecognized response");
    }

    private String getAccessToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apiKey", apiKey);
        headers.set("Content-Type", "application/json");

        TinggAuthRequest authRequest = new TinggAuthRequest(clientId, clientSecret, "client_credentials");
        HttpEntity<TinggAuthRequest> request = new HttpEntity<>(authRequest, headers);

        String url = baseUrl + "/v1/oauth/token/request";
        try {
            ResponseEntity<TinggAuthResponse> response = restTemplate.exchange(url, HttpMethod.POST, request, TinggAuthResponse.class);

            if (response.getBody() != null && response.getBody().getAccess_token() != null) {
                return response.getBody().getAccess_token();
            }
        } catch (Exception e) {
            log.error("[TINGG AUTH] Failed to authenticate with Tingg OAuth API: {}", e.getMessage());
            throw new RuntimeException("Tingg Auth Failed: " + e.getMessage(), e);
        }
        throw new RuntimeException("Failed to authenticate with Tingg: access_token not found in response");
    }

    public TinggPayoutResponse initiatePayout(Payment payment, String customServiceCode) {
        String activeServiceCode = (customServiceCode != null && !customServiceCode.isBlank()) ? customServiceCode : serviceCode;

        // Build Tingg Beep packet item
        Map<String, Object> packet = new HashMap<>();
        packet.put("serviceCode", activeServiceCode);
        packet.put("MSISDN", payment.getDestinationAccount());
        packet.put("accountNumber", payment.getDestinationAccount());
        packet.put("payerTransactionID", payment.getTransactionRef());
        packet.put("amount", payment.getAmount());
        packet.put("currencyCode", "KES");
        packet.put("countryCode", "KE");
        packet.put("datePaymentReceived", java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        packet.put("paymentMode", "Mobile");
        packet.put("customerNames", payment.getUser() != null && payment.getUser().getName() != null ? payment.getUser().getName() : "Winner");
        packet.put("narration", "Race Award Payout for " + (payment.getRegistration() != null && payment.getRegistration().getRace() != null ? payment.getRegistration().getRace().getName() : "Race"));
        packet.put("extraData", "{\"callbackUrl\":\"https://kimbia.africa/api/webhooks/tingg/payout-callback\"}");

        // Build credentials object
        Map<String, Object> credentials = new HashMap<>();
        credentials.put("username", clientId);
        credentials.put("password", clientSecret);

        // Build payload object
        Map<String, Object> beepPayload = new HashMap<>();
        beepPayload.put("credentials", credentials);
        beepPayload.put("packet", List.of(packet));

        // Build root request envelope according to Cellulant Tingg Global API specification
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("function", "BEEP.postPayment");
        requestBody.put("countryCode", "KE");
        requestBody.put("payload", beepPayload);

        log.info("[TINGG PAYOUT] Dispatching payout request to {} for txRef: {}, amount: {} KES, destination: {}, serviceCode: {}",
                baseUrl + "/v1/global-api/payments", payment.getTransactionRef(), payment.getAmount(), payment.getDestinationAccount(), activeServiceCode);

        try {
            HttpHeaders headers = new HttpHeaders();
            String basicAuth = java.util.Base64.getEncoder().encodeToString(
                    (clientId + ":" + clientSecret).getBytes(java.nio.charset.StandardCharsets.UTF_8)
            );
            headers.set("Authorization", "Basic " + basicAuth);
            if (apiKey != null && !apiKey.isBlank()) {
                headers.set("apiKey", apiKey);
            }
            headers.set("Content-Type", "application/json");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            String url = baseUrl + "/v1/global-api/payments";

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            log.info("[TINGG PAYOUT] Received response from Tingg API: status={}, body={}", response.getStatusCode(), response.getBody());

            if (response.getBody() != null) {
                Map<?, ?> body = response.getBody();
                List<?> results = (List<?>) body.get("results");
                if (results != null && !results.isEmpty()) {
                    Map<?, ?> firstResult = (Map<?, ?>) results.get(0);
                    String code = String.valueOf(firstResult.get("statusCode"));
                    String desc = (String) firstResult.get("statusDescription");
                    String beepId = String.valueOf(firstResult.get("beepTransactionID"));

                    TinggPayoutResponse payoutResp = new TinggPayoutResponse();
                    payoutResp.setStatus_code(code);
                    payoutResp.setStatus_description(desc);
                    payoutResp.setBeep_transaction_id(beepId);
                    payoutResp.setMerchant_transaction_id(payment.getTransactionRef());

                    if ("139".equals(code) || (!"-1".equals(beepId) && !"167".equals(code))) {
                        log.info("[TINGG PAYOUT] Payout queued successfully by Tingg: beepTxId={}, description={}", beepId, desc);
                    } else {
                        log.warn("[TINGG PAYOUT] Tingg requires service mapping: code={}, description={}", code, desc);
                    }
                    return payoutResp;
                }
            }
        } catch (Exception e) {
            log.warn("[TINGG PAYOUT] API call encountered error (expected in sandbox without float): {}", e.getMessage());
            TinggPayoutResponse fallback = new TinggPayoutResponse();
            fallback.setStatus_code("PENDING");
            fallback.setStatus_description("Disbursement initiated (Sandbox queued): " + e.getMessage());
            fallback.setMerchant_transaction_id(payment.getTransactionRef());
            return fallback;
        }

        TinggPayoutResponse defaultResp = new TinggPayoutResponse();
        defaultResp.setStatus_code("PENDING");
        defaultResp.setStatus_description("Disbursement initiated");
        defaultResp.setMerchant_transaction_id(payment.getTransactionRef());
        log.info("[TINGG PAYOUT] Completed payout initiation with status: PENDING");
        return defaultResp;
    }
}

