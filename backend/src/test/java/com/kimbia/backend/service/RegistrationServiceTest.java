package com.kimbia.backend.service;

import com.kimbia.backend.entity.Race;
import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.PaymentStatus;
import com.kimbia.backend.enums.Role;
import com.kimbia.backend.repository.RaceRepository;
import com.kimbia.backend.repository.RegistrationRepository;
import com.kimbia.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RaceRepository raceRepository;

    @Mock
    private Authentication authentication;

    private RegistrationService registrationService;

    @BeforeEach
    void setUp() {
        registrationService = new RegistrationService(registrationRepository, userRepository, raceRepository);
    }

    @Test
    void getRegistrationById_returnsOptional() {
        Registration reg = new Registration();
        reg.setId(5);
        when(registrationRepository.findById(5)).thenReturn(Optional.of(reg));

        Optional<Registration> result = registrationService.getRegistrationById(5);
        assertTrue(result.isPresent());
        assertEquals(5, result.get().getId());
    }

    @Test
    void getRegistrationsByRaceId_returnsList() {
        Registration reg = new Registration();
        reg.setId(10);
        when(registrationRepository.findByRaceId(1)).thenReturn(List.of(reg));

        List<Registration> result = registrationService.getRegistrationsByRaceId(1);
        assertEquals(1, result.size());
        assertEquals(10, result.get(0).getId());
    }

    @Test
    void getRegistrationsForAdmin_unauthenticated_throwsSecurityException() {
        assertThrows(SecurityException.class, () ->
                registrationService.getRegistrationsForAdmin(1, null));

        when(authentication.isAuthenticated()).thenReturn(false);
        assertThrows(SecurityException.class, () ->
                registrationService.getRegistrationsForAdmin(1, authentication));
    }

    @Test
    void getRegistrationsForAdmin_userNotFound_throwsSecurityException() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("test@kimbia.africa");
        when(authentication.getName()).thenReturn("test@kimbia.africa");
        when(userRepository.findByEmail("test@kimbia.africa")).thenReturn(Optional.empty());

        assertThrows(SecurityException.class, () ->
                registrationService.getRegistrationsForAdmin(1, authentication));
    }

    @Test
    void getRegistrationsForAdmin_raceNotFound_throwsIllegalArgumentException() {
        User superAdmin = new User();
        superAdmin.setId(1);
        superAdmin.setEmail("admin@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));

        when(raceRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                registrationService.getRegistrationsForAdmin(99, authentication));
    }

    @Test
    void getRegistrationsForAdmin_nonOrganizerRaceAdmin_throwsSecurityException() {
        User organizer = new User();
        organizer.setId(10);

        Race race = new Race();
        race.setId(1);
        race.setOrganizer(organizer);

        User callerAdmin = new User();
        callerAdmin.setId(20);
        callerAdmin.setEmail("otheradmin@kimbia.africa");
        callerAdmin.setRole(Role.RACE_ADMIN);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(callerAdmin.getEmail());
        when(authentication.getName()).thenReturn(callerAdmin.getEmail());
        when(userRepository.findByEmail(callerAdmin.getEmail())).thenReturn(Optional.of(callerAdmin));

        when(raceRepository.findById(1)).thenReturn(Optional.of(race));

        assertThrows(SecurityException.class, () ->
                registrationService.getRegistrationsForAdmin(1, authentication));
    }

    @Test
    void getRegistrationsForAdmin_runnerRole_throwsSecurityException() {
        User callerRunner = new User();
        callerRunner.setId(20);
        callerRunner.setEmail("runner@kimbia.africa");
        callerRunner.setRole(Role.RUNNER);

        Race race = new Race();
        race.setId(1);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(callerRunner.getEmail());
        when(authentication.getName()).thenReturn(callerRunner.getEmail());
        when(userRepository.findByEmail(callerRunner.getEmail())).thenReturn(Optional.of(callerRunner));
        when(raceRepository.findById(1)).thenReturn(Optional.of(race));

        assertThrows(SecurityException.class, () ->
                registrationService.getRegistrationsForAdmin(1, authentication));
    }

    @Test
    void getRegistrationsForAdmin_organizer_returnsRegistrations() {
        User organizer = new User();
        organizer.setId(10);
        organizer.setEmail("organizer@kimbia.africa");
        organizer.setRole(Role.RACE_ADMIN);

        Race race = new Race();
        race.setId(1);
        race.setOrganizer(organizer);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(organizer.getEmail());
        when(authentication.getName()).thenReturn(organizer.getEmail());
        when(userRepository.findByEmail(organizer.getEmail())).thenReturn(Optional.of(organizer));
        when(raceRepository.findById(1)).thenReturn(Optional.of(race));

        Registration reg = new Registration();
        reg.setId(100);
        when(registrationRepository.findByRaceId(1)).thenReturn(List.of(reg));

        List<Registration> result = registrationService.getRegistrationsForAdmin(1, authentication);
        assertEquals(1, result.size());
        assertEquals(100, result.get(0).getId());
    }

    @Test
    void getRegistrationsForAdmin_superAdmin_returnsRegistrations() {
        User superAdmin = new User();
        superAdmin.setId(1);
        superAdmin.setEmail("admin@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);

        User organizer = new User();
        organizer.setId(10);

        Race race = new Race();
        race.setId(1);
        race.setOrganizer(organizer);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));
        when(raceRepository.findById(1)).thenReturn(Optional.of(race));

        Registration reg = new Registration();
        reg.setId(200);
        when(registrationRepository.findByRaceId(1)).thenReturn(List.of(reg));

        List<Registration> result = registrationService.getRegistrationsForAdmin(1, null, authentication);
        assertEquals(1, result.size());
        assertEquals(200, result.get(0).getId());
    }

    @Test
    void getRegistrationsForAdmin_validPaymentStatus_filtersStatus() {
        User superAdmin = new User();
        superAdmin.setId(1);
        superAdmin.setEmail("admin@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);

        Race race = new Race();
        race.setId(1);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));
        when(raceRepository.findById(1)).thenReturn(Optional.of(race));

        Registration reg = new Registration();
        reg.setId(300);
        reg.setPaymentStatus(PaymentStatus.COMPLETED);
        when(registrationRepository.findByRaceIdAndPaymentStatus(1, PaymentStatus.COMPLETED))
                .thenReturn(List.of(reg));

        List<Registration> result = registrationService.getRegistrationsForAdmin(1, "COMPLETED", authentication);
        assertEquals(1, result.size());
        assertEquals(300, result.get(0).getId());
        verify(registrationRepository).findByRaceIdAndPaymentStatus(1, PaymentStatus.COMPLETED);
    }

    @Test
    void getRegistrationsForAdmin_invalidPaymentStatus_throwsIllegalArgumentException() {
        User superAdmin = new User();
        superAdmin.setId(1);
        superAdmin.setEmail("admin@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);

        Race race = new Race();
        race.setId(1);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));
        when(raceRepository.findById(1)).thenReturn(Optional.of(race));

        assertThrows(IllegalArgumentException.class, () ->
                registrationService.getRegistrationsForAdmin(1, "INVALID_STATUS", authentication));
    }

    @Test
    void getRegistrationsByUserId_returnsList() {
        Registration reg = new Registration();
        reg.setId(400);
        when(registrationRepository.findByUserId(7)).thenReturn(List.of(reg));

        List<Registration> result = registrationService.getRegistrationsByUserId(7);
        assertEquals(1, result.size());
        assertEquals(400, result.get(0).getId());
    }
}
