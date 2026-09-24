package com.kimbia.backend.service;

import com.kimbia.backend.dto.tingg.TinggAuthResponse;
import com.kimbia.backend.dto.tingg.TinggCheckoutPayload;
import com.kimbia.backend.dto.tingg.TinggPayoutResponse;
import com.kimbia.backend.entity.Payment;
import com.kimbia.backend.entity.Race;
import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TinggServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private TinggService tinggService;

    @BeforeEach
    void setUp() {
        tinggService = new TinggService();
        ReflectionTestUtils.setField(tinggService, "baseUrl", "https://api-test.tingg.africa");
        ReflectionTestUtils.setField(tinggService, "clientId", "test-client-id");
        ReflectionTestUtils.setField(tinggService, "clientSecret", "test-client-secret");
        ReflectionTestUtils.setField(tinggService, "serviceCode", "DEFAULT_SVC");
        ReflectionTestUtils.setField(tinggService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(tinggService, "restTemplate", restTemplate);
    }

    private void mockAuthSuccess() {
        TinggAuthResponse authResp = new TinggAuthResponse();
        authResp.setAccess_token("mock-access-token");
        ResponseEntity<TinggAuthResponse> authEntity = new ResponseEntity<>(authResp, HttpStatus.OK);

        when(restTemplate.exchange(
                contains("/v1/oauth/token/request"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(TinggAuthResponse.class)
        )).thenReturn(authEntity);
    }

    @Test
    void getCheckoutUrl_successfulFormat1_returnsShortUrl() {
        mockAuthSuccess();

        Map<String, Object> checkoutBody = Map.of(
                "status", 200,
                "results", Map.of("short_url", "https://checkout.tingg.africa/s/xyz123")
        );
        ResponseEntity<Map> checkoutEntity = new ResponseEntity<>(checkoutBody, HttpStatus.OK);

        when(restTemplate.exchange(
                contains("/v3/checkout-api/checkout-request/express-request"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(checkoutEntity);

        TinggCheckoutPayload payload = new TinggCheckoutPayload();
        payload.setMerchant_transaction_id("TX_001");

        String url = tinggService.getCheckoutUrl(payload);

        assertEquals("https://checkout.tingg.africa/s/xyz123", url);
        assertEquals("DEFAULT_SVC", payload.getService_code());
    }

    @Test
    void getCheckoutUrl_successfulFormat2_returnsLongUrl() {
        mockAuthSuccess();

        Map<String, Object> checkoutBody = Map.of(
                "status", Map.of("status_code", 200, "status_description", "success"),
                "results", Map.of("long_url", "https://checkout.tingg.africa/long/abc456")
        );
        ResponseEntity<Map> checkoutEntity = new ResponseEntity<>(checkoutBody, HttpStatus.OK);

        when(restTemplate.exchange(
                contains("/v3/checkout-api/checkout-request/express-request"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(checkoutEntity);

        TinggCheckoutPayload payload = new TinggCheckoutPayload();
        payload.setMerchant_transaction_id("TX_002");

        String url = tinggService.getCheckoutUrl(payload);

        assertEquals("https://checkout.tingg.africa/long/abc456", url);
    }

    @Test
    void getCheckoutUrl_errorStatusCodeFormat1_throwsRuntimeException() {
        mockAuthSuccess();

        Map<String, Object> checkoutBody = Map.of(
                "status", 1031,
                "message", "This client is not allowed"
        );
        ResponseEntity<Map> checkoutEntity = new ResponseEntity<>(checkoutBody, HttpStatus.OK);

        when(restTemplate.exchange(
                contains("/v3/checkout-api/checkout-request/express-request"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(checkoutEntity);

        TinggCheckoutPayload payload = new TinggCheckoutPayload();
        payload.setMerchant_transaction_id("TX_003");

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                tinggService.getCheckoutUrl(payload));
        assertTrue(ex.getMessage().contains("Tingg Gateway Error (1031)"));
    }

    @Test
    void getCheckoutUrl_errorStatusCodeFormat2_throwsRuntimeException() {
        mockAuthSuccess();

        Map<String, Object> checkoutBody = Map.of(
                "status", Map.of("status_code", 400, "status_description", "Invalid amount"),
                "results", Map.of()
        );
        ResponseEntity<Map> checkoutEntity = new ResponseEntity<>(checkoutBody, HttpStatus.OK);

        when(restTemplate.exchange(
                contains("/v3/checkout-api/checkout-request/express-request"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(checkoutEntity);

        TinggCheckoutPayload payload = new TinggCheckoutPayload();
        payload.setMerchant_transaction_id("TX_004");

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                tinggService.getCheckoutUrl(payload));
        assertTrue(ex.getMessage().contains("Tingg Gateway Error (400)"));
    }

    @Test
    void getCheckoutUrl_missingResults_throwsRuntimeException() {
        mockAuthSuccess();

        Map<String, Object> checkoutBody = Map.of("status", 200);
        ResponseEntity<Map> checkoutEntity = new ResponseEntity<>(checkoutBody, HttpStatus.OK);

        when(restTemplate.exchange(
                contains("/v3/checkout-api/checkout-request/express-request"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(checkoutEntity);

        TinggCheckoutPayload payload = new TinggCheckoutPayload();
        payload.setMerchant_transaction_id("TX_005");

        assertThrows(RuntimeException.class, () -> tinggService.getCheckoutUrl(payload));
    }

    @Test
    void getCheckoutUrl_httpStatusCodeException_throwsRuntimeException() {
        mockAuthSuccess();

        when(restTemplate.exchange(
                contains("/v3/checkout-api/checkout-request/express-request"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(new HttpClientErrorException(HttpStatus.BAD_GATEWAY, "Bad Gateway"));

        TinggCheckoutPayload payload = new TinggCheckoutPayload();
        payload.setMerchant_transaction_id("TX_006");

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                tinggService.getCheckoutUrl(payload));
        assertTrue(ex.getMessage().contains("Tingg HTTP Error 502"));
    }

    @Test
    void initiatePayout_successfulStatusCode139_returnsTinggPayoutResponse() {
        Payment payment = new Payment();
        payment.setTransactionRef("AWD_100");
        payment.setAmount(BigDecimal.valueOf(2500));
        payment.setDestinationAccount("254711000000");

        User runner = new User();
        runner.setName("Kipchoge");
        payment.setUser(runner);

        Race race = new Race();
        race.setName("Nairobi 10K");
        Registration reg = new Registration();
        reg.setRace(race);
        payment.setRegistration(reg);

        Map<String, Object> payoutResult = Map.of(
                "statusCode", "139",
                "statusDescription", "Request accepted for processing",
                "beepTransactionID", "BEEP_9999"
        );
        Map<String, Object> payoutBody = Map.of(
                "results", List.of(payoutResult)
        );
        ResponseEntity<Map> payoutEntity = new ResponseEntity<>(payoutBody, HttpStatus.OK);

        when(restTemplate.exchange(
                contains("/v1/global-api/payments"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(payoutEntity);

        TinggPayoutResponse response = tinggService.initiatePayout(payment, "CUSTOM_SVC");

        assertNotNull(response);
        assertEquals("139", response.getStatus_code());
        assertEquals("Request accepted for processing", response.getStatus_description());
        assertEquals("BEEP_9999", response.getBeep_transaction_id());
        assertEquals("AWD_100", response.getMerchant_transaction_id());
    }

    @Test
    void initiatePayout_apiException_returnsPendingSandboxFallback() {
        Payment payment = new Payment();
        payment.setTransactionRef("AWD_200");
        payment.setAmount(BigDecimal.valueOf(1000));
        payment.setDestinationAccount("254700000000");

        when(restTemplate.exchange(
                contains("/v1/global-api/payments"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(new RuntimeException("Connection timeout"));

        TinggPayoutResponse response = tinggService.initiatePayout(payment, null);

        assertNotNull(response);
        assertEquals("PENDING", response.getStatus_code());
        assertTrue(response.getStatus_description().contains("Connection timeout"));
        assertEquals("AWD_200", response.getMerchant_transaction_id());
    }
}
