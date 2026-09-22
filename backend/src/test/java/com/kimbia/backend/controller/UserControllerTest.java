package com.kimbia.backend.controller;

import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.repository.UserRepository;
import com.kimbia.backend.service.RegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private RegistrationService registrationService;

    @Mock
    private UserRepository userRepository;

    private UserController userController;

    @BeforeEach
    void setUp() {
        userController = new UserController(registrationService, userRepository);
    }

    @Test
    void getMyRegistrations_returnsUserRegistrations() {
        User user = new User();
        user.setId(42);

        Registration reg = new Registration();
        reg.setId(101);

        when(registrationService.getRegistrationsByUserId(42)).thenReturn(List.of(reg));

        ResponseEntity<List<Registration>> response = userController.getMyRegistrations(user);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals(101, response.getBody().get(0).getId());
    }
}
