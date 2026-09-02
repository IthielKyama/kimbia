package com.kimbia.backend.service;

import com.kimbia.backend.dto.CheckoutResponse;
import com.kimbia.backend.dto.tingg.TinggCheckoutPayload;
import com.kimbia.backend.dto.tingg.TinggWebhookAckResponse;
import com.kimbia.backend.dto.tingg.TinggWebhookPayload;
import com.kimbia.backend.entity.Payment;
import com.kimbia.backend.entity.Race;
import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.PaymentStatus;
import com.kimbia.backend.enums.TransactionType;
import com.kimbia.backend.repository.PaymentRepository;
import com.kimbia.backend.repository.RaceRepository;
import com.kimbia.backend.repository.RegistrationRepository;
import com.kimbia.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PaymentService {

    private final UserRepository userRepository;
    private final RaceRepository raceRepository;
    private final RegistrationRepository registrationRepository;
    private final PaymentRepository paymentRepository;
    private final TinggService tinggService;

    public PaymentService(UserRepository userRepository, RaceRepository raceRepository, RegistrationRepository registrationRepository, PaymentRepository paymentRepository, TinggService tinggService) {
        this.userRepository = userRepository;
        this.raceRepository = raceRepository;
        this.registrationRepository = registrationRepository;
        this.paymentRepository = paymentRepository;
        this.tinggService = tinggService;
    }

    @Transactional
    public CheckoutResponse initiateCheckout(String userEmail, Integer raceId, String returnUrl) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        Race race = raceRepository.findById(raceId).orElseThrow(() -> new RuntimeException("Race not found"));

        Registration registration = registrationRepository.findByUserAndRace(user, race).orElse(null);

        if (registration != null) {
            if (registration.getPaymentStatus() == PaymentStatus.COMPLETED) {
                throw new RuntimeException("You are already registered for this race.");
            }
            // If PENDING, reuse the existing registration.
        } else {
            // Create new Registration
            registration = new Registration();
            registration.setUser(user);
            registration.setRace(race);
            registration.setPaymentStatus(PaymentStatus.PENDING);
            registration.setStatus("ACTIVE");
            registration = registrationRepository.save(registration);
        }

        // Create Payment
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setRegistration(registration);
        payment.setTransactionType(TransactionType.COLLECTION);
        payment.setAmount(race.getFee());
        payment.setStatus(PaymentStatus.PENDING);

        String txRef = "TX_" + UUID.randomUUID().toString().substring(0, 15);
        payment.setTransactionRef(txRef);
        payment = paymentRepository.save(payment);

        // Tingg Checkout Payload
        TinggCheckoutPayload payload = new TinggCheckoutPayload();
        payload.setCustomer_first_name(user.getName() != null ? user.getName() : "Runner");
        payload.setCustomer_last_name("Runner");
        payload.setMsisdn(user.getMobileNumber() != null ? user.getMobileNumber() : "254700000000");
        payload.setAccount_number(txRef);
        payload.setRequest_amount(race.getFee().toString());
        payload.setMerchant_transaction_id(txRef);
        payload.setCountry_code("KEN");
        payload.setCurrency_code("KES");
        payload.setCallback_url("https://webhook.site/..."); // In prod actual webhook url
        
        String redirectTarget = (returnUrl != null && !returnUrl.isEmpty()) ? returnUrl : "http://localhost:3000/races/" + race.getId() + "/checkout-success";
        
        if (redirectTarget.contains("__id__")) {
            redirectTarget = redirectTarget.replace("__id__", registration.getId().toString());
        } else if (redirectTarget.contains("{id}")) {
            redirectTarget = redirectTarget.replace("{id}", registration.getId().toString());
        } else if (redirectTarget.contains("%7Bid%7D")) {
            redirectTarget = redirectTarget.replace("%7Bid%7D", registration.getId().toString());
        }

        payload.setFail_redirect_url(redirectTarget);
        payload.setSuccess_redirect_url(redirectTarget);

        String redirectUrl = tinggService.getCheckoutUrl(payload);

        CheckoutResponse response = new CheckoutResponse();
        response.setRedirectUrl(redirectUrl);
        response.setMerchantTransactionId(txRef);
        response.setRegistrationId(registration.getId());
        return response;
    }

    @Transactional
    public TinggWebhookAckResponse processWebhook(TinggWebhookPayload payload, String rawPayload) {
        TinggWebhookAckResponse response = new TinggWebhookAckResponse();
        response.setCheckout_request_id(payload.getCheckout_request_id());
        response.setMerchant_transaction_id(payload.getMerchant_transaction_id());

        Payment payment = paymentRepository.findByTransactionRef(payload.getMerchant_transaction_id()).orElse(null);
        if (payment == null) {
            response.setStatus_code("180");
            response.setStatus_description("Payment rejected - transaction not found");
            return response;
        }

        // Idempotency check
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            response.setStatus_code("183");
            response.setStatus_description("Successfully");
            response.setReceipt_number("ACK" + payment.getId());
            return response;
        }

        payment.setRawWebhookPayload(rawPayload);

        // 178 means fully paid based on docs
        if (Integer.valueOf(178).equals(payload.getRequest_status_code())) {
            payment.setStatus(PaymentStatus.COMPLETED);

            Registration registration = payment.getRegistration();
            registration.setPaymentStatus(PaymentStatus.COMPLETED);
            // Placeholder Bib Generation
            registration.setBibNumber("BIB-" + registration.getId());
            registration.setBibImgUrl("https://via.placeholder.com/600x400.png?text=Bib+" + registration.getBibNumber());
            registrationRepository.save(registration);

            response.setStatus_code("183");
            response.setStatus_description("Successfully");
            response.setReceipt_number("ACK" + payment.getId());
        } else {
            payment.setStatus(PaymentStatus.FAILED); // Handle other statuses
            response.setStatus_code("183"); // Acknowledge receipt even if failed so tingg stops retrying
            response.setStatus_description("Received");
            response.setReceipt_number("ACK" + payment.getId());
        }

        paymentRepository.save(payment);
        return response;
    }

    @Transactional
    public void simulateSuccess(Integer registrationId) {
        Registration registration = registrationRepository.findById(registrationId).orElse(null);
        if (registration != null) {
            Payment payment = paymentRepository.findAll().stream()
                .filter(p -> p.getRegistration() != null && p.getRegistration().getId().equals(registrationId))
                .findFirst().orElse(null);
            if (payment != null) {
                TinggWebhookPayload payload = new TinggWebhookPayload();
                payload.setMerchant_transaction_id(payment.getTransactionRef());
                payload.setRequest_status_code(178);
                processWebhook(payload, "{\"source\": \"simulated\"}");
            }
        }
    }
}

