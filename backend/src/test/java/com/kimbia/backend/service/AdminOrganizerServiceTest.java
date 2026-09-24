package com.kimbia.backend.service;

import com.kimbia.backend.dto.ApproveOrganizerRequest;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.AccountStatus;
import com.kimbia.backend.enums.Role;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminOrganizerServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    private AdminOrganizerService adminOrganizerService;

    @BeforeEach
    void setUp() {
        adminOrganizerService = new AdminOrganizerService(userRepository);
    }

    private User createSuperAdmin() {
        User superAdmin = new User();
        superAdmin.setId(1);
        superAdmin.setEmail("admin@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);
        return superAdmin;
    }

    @Test
    void getOrganizers_unauthenticated_throwsSecurityException() {
        assertThrows(SecurityException.class, () ->
                adminOrganizerService.getOrganizers(null, null));

        when(authentication.isAuthenticated()).thenReturn(false);
        assertThrows(SecurityException.class, () ->
                adminOrganizerService.getOrganizers(null, authentication));
    }

    @Test
    void getOrganizers_userNotFound_throwsSecurityException() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("not_anonymous");
        when(authentication.getName()).thenReturn("unknown@kimbia.africa");
        when(userRepository.findByEmail("unknown@kimbia.africa")).thenReturn(Optional.empty());

        assertThrows(SecurityException.class, () ->
                adminOrganizerService.getOrganizers(null, authentication));
    }

    @Test
    void getOrganizers_nonSuperAdmin_throwsSecurityException() {
        User runner = new User();
        runner.setId(2);
        runner.setEmail("runner@kimbia.africa");
        runner.setRole(Role.RUNNER);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("runner@kimbia.africa");
        when(authentication.getName()).thenReturn("runner@kimbia.africa");
        when(userRepository.findByEmail("runner@kimbia.africa")).thenReturn(Optional.of(runner));

        assertThrows(SecurityException.class, () ->
                adminOrganizerService.getOrganizers(null, authentication));
    }

    @Test
    void getOrganizers_superAdminWithoutStatus_returnsAllOrganizers() {
        User superAdmin = createSuperAdmin();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));

        User organizer1 = new User();
        organizer1.setId(10);
        organizer1.setRole(Role.RACE_ADMIN);
        when(userRepository.findByRoleOrderByCreatedAtDesc(Role.RACE_ADMIN))
                .thenReturn(List.of(organizer1));

        List<User> result = adminOrganizerService.getOrganizers(null, authentication);

        assertEquals(1, result.size());
        assertEquals(10, result.get(0).getId());
        verify(userRepository).findByRoleOrderByCreatedAtDesc(Role.RACE_ADMIN);
    }

    @Test
    void getOrganizers_superAdminWithStatus_returnsFilteredOrganizers() {
        User superAdmin = createSuperAdmin();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));

        User organizer = new User();
        organizer.setId(11);
        organizer.setRole(Role.RACE_ADMIN);
        organizer.setStatus(AccountStatus.PENDING_VETTING);
        when(userRepository.findByRoleAndStatusOrderByCreatedAtDesc(Role.RACE_ADMIN, AccountStatus.PENDING_VETTING))
                .thenReturn(List.of(organizer));

        List<User> result = adminOrganizerService.getOrganizers(AccountStatus.PENDING_VETTING, authentication);

        assertEquals(1, result.size());
        assertEquals(AccountStatus.PENDING_VETTING, result.get(0).getStatus());
        verify(userRepository).findByRoleAndStatusOrderByCreatedAtDesc(Role.RACE_ADMIN, AccountStatus.PENDING_VETTING);
    }

    @Test
    void approveOrganizer_nonSuperAdmin_throwsSecurityException() {
        User raceAdmin = new User();
        raceAdmin.setId(3);
        raceAdmin.setEmail("organizer@kimbia.africa");
        raceAdmin.setRole(Role.RACE_ADMIN);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("organizer@kimbia.africa");
        when(authentication.getName()).thenReturn("organizer@kimbia.africa");
        when(userRepository.findByEmail("organizer@kimbia.africa")).thenReturn(Optional.of(raceAdmin));

        ApproveOrganizerRequest req = new ApproveOrganizerRequest();
        req.setTinggServiceCode("TINGG001");

        assertThrows(SecurityException.class, () ->
                adminOrganizerService.approveOrganizer(10, req, authentication));
    }

    @Test
    void approveOrganizer_organizerNotFound_throwsIllegalArgumentException() {
        User superAdmin = createSuperAdmin();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));

        when(userRepository.findById(99)).thenReturn(Optional.empty());

        ApproveOrganizerRequest req = new ApproveOrganizerRequest();
        req.setTinggServiceCode("TINGG001");

        assertThrows(IllegalArgumentException.class, () ->
                adminOrganizerService.approveOrganizer(99, req, authentication));
    }

    @Test
    void approveOrganizer_userNotRaceAdmin_throwsIllegalArgumentException() {
        User superAdmin = createSuperAdmin();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));

        User regularUser = new User();
        regularUser.setId(20);
        regularUser.setRole(Role.RUNNER);
        when(userRepository.findById(20)).thenReturn(Optional.of(regularUser));

        ApproveOrganizerRequest req = new ApproveOrganizerRequest();
        req.setTinggServiceCode("TINGG001");

        assertThrows(IllegalArgumentException.class, () ->
                adminOrganizerService.approveOrganizer(20, req, authentication));
    }

    @Test
    void approveOrganizer_nullOrEmptyTinggServiceCode_throwsIllegalArgumentException() {
        User superAdmin = createSuperAdmin();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));

        User organizer = new User();
        organizer.setId(21);
        organizer.setRole(Role.RACE_ADMIN);
        when(userRepository.findById(21)).thenReturn(Optional.of(organizer));

        ApproveOrganizerRequest reqNull = new ApproveOrganizerRequest();
        reqNull.setTinggServiceCode(null);
        assertThrows(IllegalArgumentException.class, () ->
                adminOrganizerService.approveOrganizer(21, reqNull, authentication));

        ApproveOrganizerRequest reqBlank = new ApproveOrganizerRequest();
        reqBlank.setTinggServiceCode("   ");
        assertThrows(IllegalArgumentException.class, () ->
                adminOrganizerService.approveOrganizer(21, reqBlank, authentication));

        assertThrows(IllegalArgumentException.class, () ->
                adminOrganizerService.approveOrganizer(21, null, authentication));
    }

    @Test
    void approveOrganizer_validRequest_approvesAndSavesCode() {
        User superAdmin = createSuperAdmin();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));

        User organizer = new User();
        organizer.setId(22);
        organizer.setRole(Role.RACE_ADMIN);
        organizer.setStatus(AccountStatus.PENDING_VETTING);
        when(userRepository.findById(22)).thenReturn(Optional.of(organizer));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApproveOrganizerRequest req = new ApproveOrganizerRequest();
        req.setTinggServiceCode(" TINGG_KENYA ");

        User result = adminOrganizerService.approveOrganizer(22, req, authentication);

        assertEquals(AccountStatus.APPROVED, result.getStatus());
        assertEquals("TINGG_KENYA", result.getTinggServiceCode());
        verify(userRepository).save(organizer);
    }
}
