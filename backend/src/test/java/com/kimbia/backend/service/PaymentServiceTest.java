package com.kimbia.backend.service;

import com.kimbia.backend.dto.AwardPayoutRequest;
import com.kimbia.backend.dto.CheckoutResponse;
import com.kimbia.backend.dto.tingg.TinggPayoutCallbackPayload;
import com.kimbia.backend.dto.tingg.TinggPayoutResponse;
import com.kimbia.backend.dto.tingg.TinggWebhookAckResponse;
import com.kimbia.backend.dto.tingg.TinggWebhookPayload;
import com.kimbia.backend.entity.*;
import com.kimbia.backend.enums.*;
import com.kimbia.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RaceRepository raceRepository;

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private RaceResultRepository raceResultRepository;

    @Mock
    private TinggService tinggService;

    @Mock
    private Authentication authentication;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                userRepository,
                raceRepository,
                registrationRepository,
                paymentRepository,
                raceResultRepository,
                tinggService
        );
        ReflectionTestUtils.setField(paymentService, "simulateOnFailure", true);
    }

    private User createUser(Integer id, String email, Role role) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setName("Runner " + id);
        user.setMobileNumber("254711223344");
        user.setRole(role);
        return user;
    }

    private Race createRace(Integer id, BigDecimal fee) {
        Race race = new Race();
        race.setId(id);
        race.setName("Nairobi Marathon");
        race.setFee(fee);
        return race;
    }

    @Test
    void initiateCheckout_userNotFound_throwsRuntimeException() {
        when(userRepository.findByEmail("unknown@kimbia.africa")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                paymentService.initiateCheckout("unknown@kimbia.africa", 1, null));
    }

    @Test
    void initiateCheckout_raceNotFound_throwsRuntimeException() {
        User user = createUser(1, "user@kimbia.africa", Role.RUNNER);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(raceRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                paymentService.initiateCheckout(user.getEmail(), 999, null));
    }

    @Test
    void initiateCheckout_alreadyRegisteredCompleted_throwsRuntimeException() {
        User user = createUser(1, "user@kimbia.africa", Role.RUNNER);
        Race race = createRace(10, BigDecimal.valueOf(1000));

        Registration reg = new Registration();
        reg.setUser(user);
        reg.setRace(race);
        reg.setPaymentStatus(PaymentStatus.COMPLETED);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(raceRepository.findById(race.getId())).thenReturn(Optional.of(race));
        when(registrationRepository.findByUserAndRace(user, race)).thenReturn(Optional.of(reg));

        assertThrows(RuntimeException.class, () ->
                paymentService.initiateCheckout(user.getEmail(), race.getId(), null));
    }

    @Test
    void initiateCheckout_existingPendingRegistration_reusesRegistrationAndCreatesPayment() {
        User user = createUser(1, "user@kimbia.africa", Role.RUNNER);
        Race race = createRace(10, BigDecimal.valueOf(1000));

        Registration reg = new Registration();
        reg.setId(42);
        reg.setUser(user);
        reg.setRace(race);
        reg.setPaymentStatus(PaymentStatus.PENDING);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(raceRepository.findById(race.getId())).thenReturn(Optional.of(race));
        when(registrationRepository.findByUserAndRace(user, race)).thenReturn(Optional.of(reg));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(tinggService.getCheckoutUrl(any())).thenReturn("https://checkout.tingg.africa/express/tx123");

        CheckoutResponse response = paymentService.initiateCheckout(user.getEmail(), race.getId(), null);

        assertNotNull(response);
        assertEquals(42, response.getRegistrationId());
        assertEquals("https://checkout.tingg.africa/express/tx123", response.getRedirectUrl());
        assertTrue(response.getMerchantTransactionId().startsWith("TX_"));
        verify(registrationRepository, never()).save(any());
    }

    @Test
    void initiateCheckout_newRegistration_createsActiveRegistrationAndPendingPayment() {
        User user = createUser(2, "newrunner@kimbia.africa", Role.RUNNER);
        Race race = createRace(20, BigDecimal.valueOf(2000));

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(raceRepository.findById(race.getId())).thenReturn(Optional.of(race));
        when(registrationRepository.findByUserAndRace(user, race)).thenReturn(Optional.empty());

        when(registrationRepository.save(any(Registration.class))).thenAnswer(inv -> {
            Registration r = inv.getArgument(0);
            r.setId(77);
            return r;
        });
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(tinggService.getCheckoutUrl(any())).thenReturn("https://checkout.tingg.africa/express/tx77");

        CheckoutResponse response = paymentService.initiateCheckout(user.getEmail(), race.getId(), "http://frontend/success?regId=__id__");

        assertNotNull(response);
        assertEquals(77, response.getRegistrationId());
        assertEquals("https://checkout.tingg.africa/express/tx77", response.getRedirectUrl());
        verify(registrationRepository).save(any(Registration.class));
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void initiateCheckout_returnUrlPlaceholders_replacesIdCorrectly() {
        User user = createUser(3, "runner3@kimbia.africa", Role.RUNNER);
        Race race = createRace(30, BigDecimal.valueOf(500));

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(raceRepository.findById(race.getId())).thenReturn(Optional.of(race));
        when(registrationRepository.findByUserAndRace(user, race)).thenReturn(Optional.empty());

        when(registrationRepository.save(any(Registration.class))).thenAnswer(inv -> {
            Registration r = inv.getArgument(0);
            r.setId(88);
            return r;
        });
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(tinggService.getCheckoutUrl(any())).thenAnswer(inv -> "https://tingg.url");

        paymentService.initiateCheckout(user.getEmail(), race.getId(), "http://frontend/verify/{id}");
        paymentService.initiateCheckout(user.getEmail(), race.getId(), "http://frontend/verify/%7Bid%7D");

        verify(tinggService, times(2)).getCheckoutUrl(any());
    }

    @Test
    void initiateCheckout_tinggFailureWithSimulation_callsSimulateSuccessAndReturnsRedirect() {
        User user = createUser(4, "runner4@kimbia.africa", Role.RUNNER);
        Race race = createRace(40, BigDecimal.valueOf(1500));

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(raceRepository.findById(race.getId())).thenReturn(Optional.of(race));
        when(registrationRepository.findByUserAndRace(user, race)).thenReturn(Optional.empty());

        Registration savedReg = new Registration();
        savedReg.setId(99);
        savedReg.setUser(user);
        savedReg.setRace(race);
        when(registrationRepository.save(any(Registration.class))).thenReturn(savedReg);
        when(registrationRepository.findById(99)).thenReturn(Optional.of(savedReg));

        Payment payment = new Payment();
        payment.setId(101);
        payment.setRegistration(savedReg);
        payment.setTransactionRef("TX_SIMULATE");
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        when(paymentRepository.findAll()).thenReturn(List.of(payment));
        when(paymentRepository.findByTransactionRef("TX_SIMULATE")).thenReturn(Optional.of(payment));

        when(tinggService.getCheckoutUrl(any())).thenThrow(new RuntimeException("Tingg connection refused"));

        CheckoutResponse response = paymentService.initiateCheckout(user.getEmail(), race.getId(), "http://kimbia.africa/race/__id__");

        assertNotNull(response);
        assertEquals("http://kimbia.africa/race/99", response.getRedirectUrl());
    }

    @Test
    void initiateCheckout_tinggFailureWithoutSimulation_rethrowsException() {
        ReflectionTestUtils.setField(paymentService, "simulateOnFailure", false);

        User user = createUser(5, "runner5@kimbia.africa", Role.RUNNER);
        Race race = createRace(50, BigDecimal.valueOf(1000));

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(raceRepository.findById(race.getId())).thenReturn(Optional.of(race));
        when(registrationRepository.findByUserAndRace(user, race)).thenReturn(Optional.empty());

        Registration savedReg = new Registration();
        savedReg.setId(105);
        when(registrationRepository.save(any(Registration.class))).thenReturn(savedReg);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        when(tinggService.getCheckoutUrl(any())).thenThrow(new RuntimeException("Tingg error"));

        assertThrows(RuntimeException.class, () ->
                paymentService.initiateCheckout(user.getEmail(), race.getId(), null));
    }

    @Test
    void processWebhook_transactionNotFound_returnsStatusCode180() {
        TinggWebhookPayload payload = new TinggWebhookPayload();
        payload.setMerchant_transaction_id("TX_UNKNOWN");
        payload.setCheckout_request_id("REQ_1");

        when(paymentRepository.findByTransactionRef("TX_UNKNOWN")).thenReturn(Optional.empty());

        TinggWebhookAckResponse response = paymentService.processWebhook(payload, "{}");

        assertEquals("180", response.getStatus_code());
        assertEquals("Payment rejected - transaction not found", response.getStatus_description());
    }

    @Test
    void processWebhook_alreadyCompleted_idempotentSuccess183() {
        Payment payment = new Payment();
        payment.setId(55);
        payment.setStatus(PaymentStatus.COMPLETED);

        TinggWebhookPayload payload = new TinggWebhookPayload();
        payload.setMerchant_transaction_id("TX_COMPLETED");

        when(paymentRepository.findByTransactionRef("TX_COMPLETED")).thenReturn(Optional.of(payment));

        TinggWebhookAckResponse response = paymentService.processWebhook(payload, "{}");

        assertEquals("183", response.getStatus_code());
        assertEquals("Successfully", response.getStatus_description());
        assertEquals("ACK55", response.getReceipt_number());
    }

    @Test
    void processWebhook_statusCode178_completesPaymentAndAssignsBib() {
        Registration reg = new Registration();
        reg.setId(200);

        Payment payment = new Payment();
        payment.setId(66);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setRegistration(reg);

        TinggWebhookPayload payload = new TinggWebhookPayload();
        payload.setMerchant_transaction_id("TX_SUCCESS");
        payload.setRequest_status_code(178);

        when(paymentRepository.findByTransactionRef("TX_SUCCESS")).thenReturn(Optional.of(payment));

        TinggWebhookAckResponse response = paymentService.processWebhook(payload, "{\"status\": 178}");

        assertEquals("183", response.getStatus_code());
        assertEquals("Successfully", response.getStatus_description());
        assertEquals("ACK66", response.getReceipt_number());
        assertEquals(PaymentStatus.COMPLETED, payment.getStatus());
        assertEquals(PaymentStatus.COMPLETED, reg.getPaymentStatus());
        assertEquals("BIB-200", reg.getBibNumber());
        assertTrue(reg.getBibImgUrl().contains("BIB-200"));
        verify(registrationRepository).save(reg);
        verify(paymentRepository).save(payment);
    }

    @Test
    void processWebhook_non178StatusCode_marksPaymentFailed() {
        Payment payment = new Payment();
        payment.setId(77);
        payment.setStatus(PaymentStatus.PENDING);

        TinggWebhookPayload payload = new TinggWebhookPayload();
        payload.setMerchant_transaction_id("TX_FAILED");
        payload.setRequest_status_code(181);

        when(paymentRepository.findByTransactionRef("TX_FAILED")).thenReturn(Optional.of(payment));

        TinggWebhookAckResponse response = paymentService.processWebhook(payload, "{\"status\": 181}");

        assertEquals("183", response.getStatus_code());
        assertEquals("Received", response.getStatus_description());
        assertEquals(PaymentStatus.FAILED, payment.getStatus());
        verify(paymentRepository).save(payment);
    }

    @Test
    void processAwardPayout_nullRegistrationId_throwsIllegalArgumentException() {
        AwardPayoutRequest req = new AwardPayoutRequest();
        req.setRegistrationId(null);
        req.setAmount(BigDecimal.valueOf(5000));

        assertThrows(IllegalArgumentException.class, () ->
                paymentService.processAwardPayout(req, authentication));
    }

    @Test
    void processAwardPayout_nullOrZeroOrNegativeAmount_throwsIllegalArgumentException() {
        AwardPayoutRequest req1 = new AwardPayoutRequest();
        req1.setRegistrationId(1);
        req1.setAmount(null);
        assertThrows(IllegalArgumentException.class, () -> paymentService.processAwardPayout(req1, authentication));

        AwardPayoutRequest req2 = new AwardPayoutRequest();
        req2.setRegistrationId(1);
        req2.setAmount(BigDecimal.ZERO);
        assertThrows(IllegalArgumentException.class, () -> paymentService.processAwardPayout(req2, authentication));

        AwardPayoutRequest req3 = new AwardPayoutRequest();
        req3.setRegistrationId(1);
        req3.setAmount(BigDecimal.valueOf(-100));
        assertThrows(IllegalArgumentException.class, () -> paymentService.processAwardPayout(req3, authentication));
    }

    @Test
    void processAwardPayout_registrationNotFound_throwsIllegalArgumentException() {
        AwardPayoutRequest req = new AwardPayoutRequest();
        req.setRegistrationId(999);
        req.setAmount(BigDecimal.valueOf(5000));

        when(registrationRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                paymentService.processAwardPayout(req, authentication));
    }

    @Test
    void processAwardPayout_raceAdminNotOrganizer_throwsSecurityException() {
        User organizer = createUser(10, "owner@kimbia.africa", Role.RACE_ADMIN);
        Race race = createRace(1, BigDecimal.ZERO);
        race.setOrganizer(organizer);

        Registration reg = new Registration();
        reg.setId(5);
        reg.setRace(race);

        User callerAdmin = createUser(20, "caller@kimbia.africa", Role.RACE_ADMIN);

        when(registrationRepository.findById(5)).thenReturn(Optional.of(reg));
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(callerAdmin.getEmail());
        when(authentication.getName()).thenReturn(callerAdmin.getEmail());
        when(userRepository.findByEmail(callerAdmin.getEmail())).thenReturn(Optional.of(callerAdmin));

        AwardPayoutRequest req = new AwardPayoutRequest();
        req.setRegistrationId(5);
        req.setAmount(BigDecimal.valueOf(1000));

        assertThrows(SecurityException.class, () ->
                paymentService.processAwardPayout(req, authentication));
    }

    @Test
    void processAwardPayout_missingRaceResult_throwsIllegalStateException() {
        User user = createUser(1, "runner@kimbia.africa", Role.RUNNER);
        Race race = createRace(1, BigDecimal.ZERO);
        Registration reg = new Registration();
        reg.setId(10);
        reg.setUser(user);
        reg.setRace(race);

        when(registrationRepository.findById(10)).thenReturn(Optional.of(reg));
        when(raceResultRepository.findByRegistrationId(10)).thenReturn(Optional.empty());

        AwardPayoutRequest req = new AwardPayoutRequest();
        req.setRegistrationId(10);
        req.setAmount(BigDecimal.valueOf(1000));

        assertThrows(IllegalStateException.class, () ->
                paymentService.processAwardPayout(req, null));
    }

    @Test
    void processAwardPayout_resultNotApproved_throwsIllegalStateException() {
        User user = createUser(1, "runner@kimbia.africa", Role.RUNNER);
        Race race = createRace(1, BigDecimal.ZERO);
        Registration reg = new Registration();
        reg.setId(10);
        reg.setUser(user);
        reg.setRace(race);

        RaceResult result = new RaceResult();
        result.setModerationStatus(ModerationStatus.PENDING);

        when(registrationRepository.findById(10)).thenReturn(Optional.of(reg));
        when(raceResultRepository.findByRegistrationId(10)).thenReturn(Optional.of(result));

        AwardPayoutRequest req = new AwardPayoutRequest();
        req.setRegistrationId(10);
        req.setAmount(BigDecimal.valueOf(1000));

        assertThrows(IllegalStateException.class, () ->
                paymentService.processAwardPayout(req, null));
    }

    @Test
    void processAwardPayout_noDestinationOrMobile_throwsIllegalArgumentException() {
        User user = new User();
        user.setId(1);
        user.setMobileNumber(null); // No mobile

        Registration reg = new Registration();
        reg.setId(11);
        reg.setUser(user);

        RaceResult result = new RaceResult();
        result.setModerationStatus(ModerationStatus.APPROVED);

        when(registrationRepository.findById(11)).thenReturn(Optional.of(reg));
        when(raceResultRepository.findByRegistrationId(11)).thenReturn(Optional.of(result));

        AwardPayoutRequest req = new AwardPayoutRequest();
        req.setRegistrationId(11);
        req.setAmount(BigDecimal.valueOf(1000));
        req.setDestinationAccount("   "); // Blank

        assertThrows(IllegalArgumentException.class, () ->
                paymentService.processAwardPayout(req, null));
    }

    @Test
    void processAwardPayout_validRequest_initiatesPayoutWithTingg() {
        User organizer = createUser(10, "owner@kimbia.africa", Role.RACE_ADMIN);
        organizer.setTinggServiceCode("ORG_SERVICE_CODE");

        Race race = createRace(1, BigDecimal.ZERO);
        race.setOrganizer(organizer);

        User runner = createUser(2, "runner@kimbia.africa", Role.RUNNER);
        runner.setMobileNumber("254700112233");

        Registration reg = new Registration();
        reg.setId(12);
        reg.setUser(runner);
        reg.setRace(race);

        RaceResult result = new RaceResult();
        result.setModerationStatus(ModerationStatus.APPROVED);

        when(registrationRepository.findById(12)).thenReturn(Optional.of(reg));
        when(raceResultRepository.findByRegistrationId(12)).thenReturn(Optional.of(result));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(888);
            return p;
        });

        TinggPayoutResponse tinggResp = new TinggPayoutResponse();
        tinggResp.setStatus_code("139");
        when(tinggService.initiatePayout(any(Payment.class), eq("ORG_SERVICE_CODE"))).thenReturn(tinggResp);

        AwardPayoutRequest req = new AwardPayoutRequest();
        req.setRegistrationId(12);
        req.setAmount(BigDecimal.valueOf(5000));
        req.setAwardType("AIRTIME");
        req.setDestinationAccount("254799887766");

        Map<String, Object> response = paymentService.processAwardPayout(req, null);

        assertNotNull(response);
        assertEquals(888, response.get("payment_id"));
        assertEquals("139", response.get("gateway_status"));
        assertEquals("AIRTIME", response.get("award_type"));
        assertEquals("254799887766", response.get("destination_account"));
        verify(tinggService).initiatePayout(any(Payment.class), eq("ORG_SERVICE_CODE"));
    }

    @Test
    void handlePayoutCallback_blankMerchantTxId_throwsIllegalArgumentException() {
        TinggPayoutCallbackPayload payload = new TinggPayoutCallbackPayload();
        payload.setMerchant_transaction_id("   ");

        assertThrows(IllegalArgumentException.class, () ->
                paymentService.handlePayoutCallback(payload, "{}"));
    }

    @Test
    void handlePayoutCallback_paymentNotFound_throwsIllegalArgumentException() {
        TinggPayoutCallbackPayload payload = new TinggPayoutCallbackPayload();
        payload.setMerchant_transaction_id("AWD_MISSING");

        when(paymentRepository.findByTransactionRef("AWD_MISSING")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                paymentService.handlePayoutCallback(payload, "{}"));
    }

    @Test
    void handlePayoutCallback_alreadyCompleted_returnsAlreadyProcessed() {
        Payment payment = new Payment();
        payment.setTransactionRef("AWD_1");
        payment.setStatus(PaymentStatus.COMPLETED);

        TinggPayoutCallbackPayload payload = new TinggPayoutCallbackPayload();
        payload.setMerchant_transaction_id("AWD_1");

        when(paymentRepository.findByTransactionRef("AWD_1")).thenReturn(Optional.of(payment));

        Map<String, Object> resp = paymentService.handlePayoutCallback(payload, "{}");

        assertEquals("already_processed", resp.get("status"));
        assertEquals("COMPLETED", resp.get("payment_status"));
    }

    @Test
    void handlePayoutCallback_statusCodes217_178_200_completesPayment() {
        for (int code : List.of(217, 178, 200)) {
            Payment payment = new Payment();
            payment.setTransactionRef("AWD_CODE_" + code);
            payment.setStatus(PaymentStatus.PENDING);

            TinggPayoutCallbackPayload payload = new TinggPayoutCallbackPayload();
            payload.setMerchant_transaction_id("AWD_CODE_" + code);
            payload.setRequest_status_code(code);

            when(paymentRepository.findByTransactionRef("AWD_CODE_" + code)).thenReturn(Optional.of(payment));

            Map<String, Object> resp = paymentService.handlePayoutCallback(payload, "{\"code\": " + code + "}");

            assertEquals("acknowledged", resp.get("status"));
            assertEquals("COMPLETED", resp.get("payment_status"));
            assertEquals(PaymentStatus.COMPLETED, payment.getStatus());
        }
    }

    @Test
    void handlePayoutCallback_otherStatusCode_marksPaymentFailed() {
        Payment payment = new Payment();
        payment.setTransactionRef("AWD_FAIL");
        payment.setStatus(PaymentStatus.PENDING);

        TinggPayoutCallbackPayload payload = new TinggPayoutCallbackPayload();
        payload.setMerchant_transaction_id("AWD_FAIL");
        payload.setRequest_status_code(167);

        when(paymentRepository.findByTransactionRef("AWD_FAIL")).thenReturn(Optional.of(payment));

        Map<String, Object> resp = paymentService.handlePayoutCallback(payload, "{}");

        assertEquals("acknowledged", resp.get("status"));
        assertEquals("FAILED", resp.get("payment_status"));
        assertEquals(PaymentStatus.FAILED, payment.getStatus());
    }

    @Test
    void simulatePayoutSuccess_paymentFound_marksCompleted() {
        Payment payment = new Payment();
        payment.setId(100);
        payment.setStatus(PaymentStatus.PENDING);

        when(paymentRepository.findById(100)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Payment updated = paymentService.simulatePayoutSuccess(100);

        assertEquals(PaymentStatus.COMPLETED, updated.getStatus());
        assertTrue(updated.getRawWebhookPayload().contains("simulated_payout_webhook"));
    }

    @Test
    void simulatePayoutSuccess_paymentNotFound_throwsIllegalArgumentException() {
        when(paymentRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> paymentService.simulatePayoutSuccess(999));
    }

    @Test
    void getAwardPayments_unauthenticated_throwsSecurityException() {
        assertThrows(SecurityException.class, () ->
                paymentService.getAwardPayments(1, AwardType.MONEY, null));
    }

    @Test
    void getAwardPayments_superAdmin_allFilterCombinations() {
        User superAdmin = createUser(1, "super@kimbia.africa", Role.SUPER_ADMIN);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));

        Payment p = new Payment();
        when(paymentRepository.findByTransactionTypeAndRaceIdAndAwardType(TransactionType.AWARD, 1, AwardType.MONEY))
                .thenReturn(List.of(p));
        when(paymentRepository.findByTransactionTypeAndRaceId(TransactionType.AWARD, 1))
                .thenReturn(List.of(p));
        when(paymentRepository.findByTransactionTypeAndAwardType(TransactionType.AWARD, AwardType.MONEY))
                .thenReturn(List.of(p));
        when(paymentRepository.findByTransactionTypeOrderByIdDesc(TransactionType.AWARD))
                .thenReturn(List.of(p));

        assertEquals(1, paymentService.getAwardPayments(1, AwardType.MONEY, authentication).size());
        assertEquals(1, paymentService.getAwardPayments(1, null, authentication).size());
        assertEquals(1, paymentService.getAwardPayments(null, AwardType.MONEY, authentication).size());
        assertEquals(1, paymentService.getAwardPayments(null, null, authentication).size());

        // Test convenience overloads
        assertEquals(1, paymentService.getAwardPayments().size());
        assertEquals(1, paymentService.getAwardPaymentsByRace(1).size());
        assertEquals(1, paymentService.getAwardPayments(1, AwardType.MONEY).size());
    }

    @Test
    void getAwardPayments_raceAdmin_allFilterCombinations() {
        User organizer = createUser(10, "organizer@kimbia.africa", Role.RACE_ADMIN);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(organizer.getEmail());
        when(authentication.getName()).thenReturn(organizer.getEmail());
        when(userRepository.findByEmail(organizer.getEmail())).thenReturn(Optional.of(organizer));

        Payment p = new Payment();
        when(paymentRepository.findByTransactionTypeAndOrganizerIdAndRaceIdAndAwardType(TransactionType.AWARD, 10, 1, AwardType.AIRTIME))
                .thenReturn(List.of(p));
        when(paymentRepository.findByTransactionTypeAndOrganizerIdAndRaceId(TransactionType.AWARD, 10, 1))
                .thenReturn(List.of(p));
        when(paymentRepository.findByTransactionTypeAndOrganizerIdAndAwardType(TransactionType.AWARD, 10, AwardType.AIRTIME))
                .thenReturn(List.of(p));
        when(paymentRepository.findByTransactionTypeAndOrganizerId(TransactionType.AWARD, 10))
                .thenReturn(List.of(p));

        assertEquals(1, paymentService.getAwardPayments(1, AwardType.AIRTIME, authentication).size());
        assertEquals(1, paymentService.getAwardPayments(1, null, authentication).size());
        assertEquals(1, paymentService.getAwardPayments(null, AwardType.AIRTIME, authentication).size());
        assertEquals(1, paymentService.getAwardPayments(null, null, authentication).size());
    }

    @Test
    void getAwardPayments_runnerRole_throwsSecurityException() {
        User runner = createUser(2, "runner@kimbia.africa", Role.RUNNER);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(runner.getEmail());
        when(authentication.getName()).thenReturn(runner.getEmail());
        when(userRepository.findByEmail(runner.getEmail())).thenReturn(Optional.of(runner));

        assertThrows(SecurityException.class, () ->
                paymentService.getAwardPayments(1, AwardType.MONEY, authentication));
    }
}
