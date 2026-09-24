package com.kimbia.backend.service;

import com.kimbia.backend.dto.ModerateResultRequest;
import com.kimbia.backend.dto.SubmitResultRequest;
import com.kimbia.backend.entity.Race;
import com.kimbia.backend.entity.RaceResult;
import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.ModerationStatus;
import com.kimbia.backend.enums.PaymentStatus;
import com.kimbia.backend.enums.Role;
import com.kimbia.backend.repository.RaceRepository;
import com.kimbia.backend.repository.RaceResultRepository;
import com.kimbia.backend.repository.RegistrationRepository;
import com.kimbia.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RaceResultServiceTest {

    @Mock
    private RaceResultRepository raceResultRepository;

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RaceRepository raceRepository;

    @Mock
    private Authentication authentication;

    private RaceResultService raceResultService;

    @BeforeEach
    void setUp() {
        raceResultService = new RaceResultService(raceResultRepository, registrationRepository, userRepository, raceRepository);
    }

    @Test
    void submitResult_nullRegistrationId_throwsIllegalArgumentException() {
        SubmitResultRequest req = new SubmitResultRequest();
        req.setRegistrationId(null);

        assertThrows(IllegalArgumentException.class, () -> raceResultService.submitResult(req, authentication));
    }

    @Test
    void submitResult_registrationNotFound_throwsIllegalArgumentException() {
        SubmitResultRequest req = new SubmitResultRequest();
        req.setRegistrationId(999);

        when(registrationRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> raceResultService.submitResult(req, authentication));
    }

    @Test
    void submitResult_differentUserNonAdmin_throwsSecurityException() {
        User regUser = new User();
        regUser.setEmail("runner1@kimbia.africa");

        Registration reg = new Registration();
        reg.setId(1);
        reg.setUser(regUser);

        SubmitResultRequest req = new SubmitResultRequest();
        req.setRegistrationId(1);

        when(registrationRepository.findById(1)).thenReturn(Optional.of(reg));
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("otherrunner@kimbia.africa");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_RUNNER"))).when(authentication).getAuthorities();

        assertThrows(SecurityException.class, () -> raceResultService.submitResult(req, authentication));
    }

    @Test
    void submitResult_paymentNotCompleted_throwsIllegalStateException() {
        User regUser = new User();
        regUser.setEmail("runner@kimbia.africa");

        Registration reg = new Registration();
        reg.setId(2);
        reg.setUser(regUser);
        reg.setPaymentStatus(PaymentStatus.PENDING);

        SubmitResultRequest req = new SubmitResultRequest();
        req.setRegistrationId(2);

        when(registrationRepository.findById(2)).thenReturn(Optional.of(reg));
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("runner@kimbia.africa");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_RUNNER"))).when(authentication).getAuthorities();

        assertThrows(IllegalStateException.class, () -> raceResultService.submitResult(req, authentication));
    }

    @Test
    void submitResult_newResult_createsResultWithPendingStatus() {
        User regUser = new User();
        regUser.setEmail("runner@kimbia.africa");

        Registration reg = new Registration();
        reg.setId(3);
        reg.setUser(regUser);
        reg.setPaymentStatus(PaymentStatus.COMPLETED);

        SubmitResultRequest req = new SubmitResultRequest();
        req.setRegistrationId(3);
        req.setFinishingTime("00:42:15");
        req.setProofImageUrl("http://uploads/proof.jpg");
        req.setIsDnf(false);

        when(registrationRepository.findById(3)).thenReturn(Optional.of(reg));
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("runner@kimbia.africa");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_RUNNER"))).when(authentication).getAuthorities();

        when(raceResultRepository.findByRegistrationId(3)).thenReturn(Optional.empty());
        when(raceResultRepository.save(any(RaceResult.class))).thenAnswer(inv -> inv.getArgument(0));

        RaceResult result = raceResultService.submitResult(req, authentication);

        assertNotNull(result);
        assertEquals("00:42:15", result.getFinishingTime());
        assertEquals("http://uploads/proof.jpg", result.getProofImageUrl());
        assertFalse(result.getIsDnf());
        assertEquals(ModerationStatus.PENDING, result.getModerationStatus());
        assertEquals(reg, result.getRegistration());
    }

    @Test
    void submitResult_existingResult_updatesFieldsAndSetsPending() {
        User regUser = new User();
        regUser.setEmail("runner@kimbia.africa");

        Registration reg = new Registration();
        reg.setId(4);
        reg.setUser(regUser);
        reg.setPaymentStatus(PaymentStatus.COMPLETED);

        RaceResult existing = new RaceResult();
        existing.setId(10);
        existing.setRegistration(reg);
        existing.setFinishingTime("01:00:00");
        existing.setModerationStatus(ModerationStatus.REJECTED);

        SubmitResultRequest req = new SubmitResultRequest();
        req.setRegistrationId(4);
        req.setFinishingTime("00:55:00");
        req.setProofImageUrl("http://uploads/newproof.jpg");
        req.setIsDnf(null);

        when(registrationRepository.findById(4)).thenReturn(Optional.of(reg));
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("admin@kimbia.africa");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))).when(authentication).getAuthorities();

        when(raceResultRepository.findByRegistrationId(4)).thenReturn(Optional.of(existing));
        when(raceResultRepository.save(any(RaceResult.class))).thenAnswer(inv -> inv.getArgument(0));

        RaceResult result = raceResultService.submitResult(req, authentication);

        assertEquals("00:55:00", result.getFinishingTime());
        assertEquals("http://uploads/newproof.jpg", result.getProofImageUrl());
        assertFalse(result.getIsDnf());
        assertEquals(ModerationStatus.PENDING, result.getModerationStatus());
    }

    @Test
    void getResultsForRaceAdmin_unauthenticated_throwsSecurityException() {
        assertThrows(SecurityException.class, () -> raceResultService.getResultsForRaceAdmin(1, null, null));
    }

    @Test
    void getResultsForRaceAdmin_raceNotFound_throwsIllegalArgumentException() {
        User admin = new User();
        admin.setEmail("admin@kimbia.africa");
        admin.setRole(Role.SUPER_ADMIN);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("admin@kimbia.africa");
        when(authentication.getName()).thenReturn("admin@kimbia.africa");
        when(userRepository.findByEmail("admin@kimbia.africa")).thenReturn(Optional.of(admin));

        when(raceRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> raceResultService.getResultsForRaceAdmin(999, null, authentication));
    }

    @Test
    void getResultsForRaceAdmin_raceAdminNotOwner_throwsSecurityException() {
        User caller = new User();
        caller.setId(10);
        caller.setEmail("admin@kimbia.africa");
        caller.setRole(Role.RACE_ADMIN);

        User owner = new User();
        owner.setId(20);

        Race race = new Race();
        race.setId(1);
        race.setOrganizer(owner);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(caller.getEmail());
        when(authentication.getName()).thenReturn(caller.getEmail());
        when(userRepository.findByEmail(caller.getEmail())).thenReturn(Optional.of(caller));
        when(raceRepository.findById(1)).thenReturn(Optional.of(race));

        assertThrows(SecurityException.class, () -> raceResultService.getResultsForRaceAdmin(1, null, authentication));
    }

    @Test
    void getResultsForRaceAdmin_runnerRole_throwsSecurityException() {
        User runner = new User();
        runner.setId(10);
        runner.setEmail("runner@kimbia.africa");
        runner.setRole(Role.RUNNER);

        Race race = new Race();
        race.setId(1);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(runner.getEmail());
        when(authentication.getName()).thenReturn(runner.getEmail());
        when(userRepository.findByEmail(runner.getEmail())).thenReturn(Optional.of(runner));
        when(raceRepository.findById(1)).thenReturn(Optional.of(race));

        assertThrows(SecurityException.class, () -> raceResultService.getResultsForRaceAdmin(1, null, authentication));
    }

    @Test
    void getResultsForRaceAdmin_superAdmin_returnsResults() {
        User superAdmin = new User();
        superAdmin.setId(1);
        superAdmin.setEmail("super@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);

        Race race = new Race();
        race.setId(1);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));
        when(raceRepository.findById(1)).thenReturn(Optional.of(race));

        RaceResult res = new RaceResult();
        when(raceResultRepository.findByRaceId(1)).thenReturn(List.of(res));

        List<RaceResult> results = raceResultService.getResultsForRaceAdmin(1, null, authentication);
        assertEquals(1, results.size());
    }

    @Test
    void getResultsForRaceAdmin_withStatusFilter_queriesFiltered() {
        User superAdmin = new User();
        superAdmin.setId(1);
        superAdmin.setEmail("super@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);

        Race race = new Race();
        race.setId(1);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));
        when(raceRepository.findById(1)).thenReturn(Optional.of(race));

        RaceResult res = new RaceResult();
        res.setModerationStatus(ModerationStatus.PENDING);
        when(raceResultRepository.findByRaceIdAndModerationStatus(1, ModerationStatus.PENDING)).thenReturn(List.of(res));

        List<RaceResult> results = raceResultService.getResultsForRaceAdmin(1, ModerationStatus.PENDING, authentication);
        assertEquals(1, results.size());
        verify(raceResultRepository).findByRaceIdAndModerationStatus(1, ModerationStatus.PENDING);
    }

    @Test
    void moderateResult_nullStatus_throwsIllegalArgumentException() {
        User superAdmin = new User();
        superAdmin.setEmail("super@kimbia.africa");

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));

        ModerateResultRequest req = new ModerateResultRequest();
        req.setModerationStatus(null);

        assertThrows(IllegalArgumentException.class, () -> raceResultService.moderateResult(1, req, authentication));
    }

    @Test
    void moderateResult_notFound_throwsIllegalArgumentException() {
        User superAdmin = new User();
        superAdmin.setEmail("super@kimbia.africa");

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));

        when(raceResultRepository.findById(999)).thenReturn(Optional.empty());

        ModerateResultRequest req = new ModerateResultRequest();
        req.setModerationStatus(ModerationStatus.APPROVED);

        assertThrows(IllegalArgumentException.class, () -> raceResultService.moderateResult(999, req, authentication));
    }

    @Test
    void moderateResult_raceAdminNotOwner_throwsSecurityException() {
        User raceAdmin = new User();
        raceAdmin.setId(10);
        raceAdmin.setEmail("organizer@kimbia.africa");
        raceAdmin.setRole(Role.RACE_ADMIN);

        User actualOwner = new User();
        actualOwner.setId(20);

        Race race = new Race();
        race.setOrganizer(actualOwner);

        Registration reg = new Registration();
        reg.setRace(race);

        RaceResult result = new RaceResult();
        result.setId(5);
        result.setRegistration(reg);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(raceAdmin.getEmail());
        when(authentication.getName()).thenReturn(raceAdmin.getEmail());
        when(userRepository.findByEmail(raceAdmin.getEmail())).thenReturn(Optional.of(raceAdmin));
        when(raceResultRepository.findById(5)).thenReturn(Optional.of(result));

        ModerateResultRequest req = new ModerateResultRequest();
        req.setModerationStatus(ModerationStatus.APPROVED);

        assertThrows(SecurityException.class, () -> raceResultService.moderateResult(5, req, authentication));
    }

    @Test
    void moderateResult_superAdmin_moderatesResult() {
        User superAdmin = new User();
        superAdmin.setId(1);
        superAdmin.setEmail("super@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);

        RaceResult result = new RaceResult();
        result.setId(6);
        result.setModerationStatus(ModerationStatus.PENDING);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(superAdmin.getEmail());
        when(authentication.getName()).thenReturn(superAdmin.getEmail());
        when(userRepository.findByEmail(superAdmin.getEmail())).thenReturn(Optional.of(superAdmin));
        when(raceResultRepository.findById(6)).thenReturn(Optional.of(result));
        when(raceResultRepository.save(any(RaceResult.class))).thenAnswer(inv -> inv.getArgument(0));

        ModerateResultRequest req = new ModerateResultRequest();
        req.setModerationStatus(ModerationStatus.APPROVED);

        RaceResult updated = raceResultService.moderateResult(6, req, authentication);

        assertEquals(ModerationStatus.APPROVED, updated.getModerationStatus());
        assertEquals(superAdmin, updated.getModeratedBy());
    }

    @Test
    void getResultsForRace_withAndWithoutStatus() {
        RaceResult r = new RaceResult();
        when(raceResultRepository.findByRaceIdAndModerationStatus(1, ModerationStatus.APPROVED)).thenReturn(List.of(r));
        when(raceResultRepository.findByRaceId(1)).thenReturn(List.of(r));

        assertEquals(1, raceResultService.getResultsForRace(1, ModerationStatus.APPROVED).size());
        assertEquals(1, raceResultService.getResultsForRace(1, null).size());
    }

    @Test
    void getLeaderboard_filtersDnfAndEmptyTimes_sortsAscendingByTime() {
        RaceResult r1 = new RaceResult();
        r1.setFinishingTime("00:45:00");
        r1.setIsDnf(false);

        RaceResult r2 = new RaceResult();
        r2.setFinishingTime("00:35:10");
        r2.setIsDnf(false);

        RaceResult r3 = new RaceResult();
        r3.setFinishingTime("01:10:00");
        r3.setIsDnf(false);

        RaceResult rDnf = new RaceResult();
        rDnf.setFinishingTime("00:20:00");
        rDnf.setIsDnf(true);

        RaceResult rEmptyTime = new RaceResult();
        rEmptyTime.setFinishingTime("   ");
        rEmptyTime.setIsDnf(false);

        RaceResult rNullTime = new RaceResult();
        rNullTime.setFinishingTime(null);
        rNullTime.setIsDnf(false);

        when(raceResultRepository.findByRaceIdAndModerationStatus(1, ModerationStatus.APPROVED))
                .thenReturn(List.of(r1, r2, r3, rDnf, rEmptyTime, rNullTime));

        List<RaceResult> leaderboard = raceResultService.getLeaderboard(1, null);

        assertEquals(3, leaderboard.size());
        assertEquals("00:35:10", leaderboard.get(0).getFinishingTime());
        assertEquals("00:45:00", leaderboard.get(1).getFinishingTime());
        assertEquals("01:10:00", leaderboard.get(2).getFinishingTime());
    }
}
