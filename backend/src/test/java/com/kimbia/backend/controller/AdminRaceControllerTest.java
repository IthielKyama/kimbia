package com.kimbia.backend.controller;

import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.service.RaceService;
import com.kimbia.backend.service.RegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminRaceControllerTest {

    @Mock
    private RegistrationService registrationService;

    @Mock
    private RaceService raceService;

    @Mock
    private Authentication authentication;

    private AdminRaceController controller;

    @BeforeEach
    void setUp() {
        controller = new AdminRaceController(registrationService, raceService);
    }

    @Test
    void getRegistrations_withPaymentStatusFilter_delegatesToService() {
        Registration reg = new Registration();
        reg.setId(5);

        when(registrationService.getRegistrationsForAdmin(1, "COMPLETED", authentication))
                .thenReturn(List.of(reg));

        ResponseEntity<?> response = controller.getRegistrations(1, "COMPLETED", authentication);

        assertEquals(200, response.getStatusCode().value());
        verify(registrationService).getRegistrationsForAdmin(1, "COMPLETED", authentication);
    }

    @Test
    void getRegistrations_withoutPaymentStatusFilter_delegatesWithNull() {
        Registration reg = new Registration();
        reg.setId(6);

        when(registrationService.getRegistrationsForAdmin(1, null, authentication))
                .thenReturn(List.of(reg));

        ResponseEntity<?> response = controller.getRegistrations(1, null, authentication);

        assertEquals(200, response.getStatusCode().value());
        verify(registrationService).getRegistrationsForAdmin(1, null, authentication);
    }
}
