package com.kimbia.backend.service;

import com.kimbia.backend.dto.CreateRaceRequest;
import com.kimbia.backend.dto.UpdateRaceRequest;
import com.kimbia.backend.dto.UpdateRaceStatusRequest;
import com.kimbia.backend.entity.Race;
import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.AccountStatus;
import com.kimbia.backend.enums.RaceStatus;
import com.kimbia.backend.enums.Role;
import com.kimbia.backend.repository.RaceRepository;
import com.kimbia.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RaceServiceTest {

    @Mock
    private RaceRepository raceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    private RaceService raceService;

    @BeforeEach
    void setUp() {
        raceService = new RaceService(raceRepository, userRepository);
    }

    private void mockAuthUser(User user) {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(user.getEmail());
        when(authentication.getName()).thenReturn(user.getEmail());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    @Test
    void getPublishedRaces_returnsPublishedRaces() {
        Race race = new Race();
        race.setStatus(RaceStatus.PUBLISHED);
        when(raceRepository.findByStatus(RaceStatus.PUBLISHED)).thenReturn(List.of(race));

        List<Race> result = raceService.getPublishedRaces();
        assertEquals(1, result.size());
        assertEquals(RaceStatus.PUBLISHED, result.get(0).getStatus());
    }

    @Test
    void getRaceById_exists_returnsRace() {
        Race race = new Race();
        race.setId(10);
        when(raceRepository.findById(10)).thenReturn(Optional.of(race));

        Race result = raceService.getRaceById(10);
        assertEquals(10, result.getId());
    }

    @Test
    void getRaceById_notFound_throwsIllegalArgumentException() {
        when(raceRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> raceService.getRaceById(99));
    }

    @Test
    void createRace_unauthenticated_throwsSecurityException() {
        CreateRaceRequest req = new CreateRaceRequest();
        assertThrows(SecurityException.class, () -> raceService.createRace(req, null));
    }

    @Test
    void createRace_runnerRole_throwsSecurityException() {
        User runner = new User();
        runner.setEmail("runner@kimbia.africa");
        runner.setRole(Role.RUNNER);
        mockAuthUser(runner);

        CreateRaceRequest req = new CreateRaceRequest();
        assertThrows(SecurityException.class, () -> raceService.createRace(req, authentication));
    }

    @Test
    void createRace_blankName_throwsIllegalArgumentException() {
        User organizer = new User();
        organizer.setEmail("organizer@kimbia.africa");
        organizer.setRole(Role.RACE_ADMIN);
        mockAuthUser(organizer);

        CreateRaceRequest req = new CreateRaceRequest();
        req.setName("   ");
        req.setDistance("10K");
        req.setRaceDate(LocalDateTime.now().plusDays(30));
        req.setFee(BigDecimal.valueOf(1000));

        assertThrows(IllegalArgumentException.class, () -> raceService.createRace(req, authentication));
    }

    @Test
    void createRace_invalidDistance_throwsIllegalArgumentException() {
        User organizer = new User();
        organizer.setEmail("organizer@kimbia.africa");
        organizer.setRole(Role.RACE_ADMIN);
        mockAuthUser(organizer);

        CreateRaceRequest req = new CreateRaceRequest();
        req.setName("Nairobi Marathon");
        req.setDistance("3K, 7K"); // 3K is invalid
        req.setRaceDate(LocalDateTime.now().plusDays(30));
        req.setFee(BigDecimal.valueOf(1000));

        assertThrows(IllegalArgumentException.class, () -> raceService.createRace(req, authentication));
    }

    @Test
    void createRace_nullRaceDate_throwsIllegalArgumentException() {
        User organizer = new User();
        organizer.setEmail("organizer@kimbia.africa");
        organizer.setRole(Role.RACE_ADMIN);
        mockAuthUser(organizer);

        CreateRaceRequest req = new CreateRaceRequest();
        req.setName("Nairobi 10K");
        req.setDistance("10K");
        req.setRaceDate(null);
        req.setFee(BigDecimal.valueOf(1000));

        assertThrows(IllegalArgumentException.class, () -> raceService.createRace(req, authentication));
    }

    @Test
    void createRace_negativeFee_throwsIllegalArgumentException() {
        User organizer = new User();
        organizer.setEmail("organizer@kimbia.africa");
        organizer.setRole(Role.RACE_ADMIN);
        mockAuthUser(organizer);

        CreateRaceRequest req = new CreateRaceRequest();
        req.setName("Nairobi 10K");
        req.setDistance("10K");
        req.setRaceDate(LocalDateTime.now().plusDays(10));
        req.setFee(BigDecimal.valueOf(-500));

        assertThrows(IllegalArgumentException.class, () -> raceService.createRace(req, authentication));
    }

    @Test
    void createRace_validRequest_defaultsDeadlineAndSetsDraft() {
        User organizer = new User();
        organizer.setId(5);
        organizer.setEmail("organizer@kimbia.africa");
        organizer.setRole(Role.RACE_ADMIN);
        mockAuthUser(organizer);

        LocalDateTime eventDate = LocalDateTime.now().plusDays(45);
        CreateRaceRequest req = new CreateRaceRequest();
        req.setName(" Rift Valley Half Marathon ");
        req.setDistance("10K, 21.1K");
        req.setRaceDate(eventDate);
        req.setFee(BigDecimal.valueOf(1500));
        req.setDescription("High altitude race");
        req.setBibTemplateUrl("http://cdn/bib.png");

        when(raceRepository.save(any(Race.class))).thenAnswer(inv -> {
            Race r = inv.getArgument(0);
            r.setId(101);
            return r;
        });

        Race created = raceService.createRace(req, authentication);

        assertNotNull(created);
        assertEquals("Rift Valley Half Marathon", created.getName());
        assertEquals("10K, 21.1K", created.getDistance());
        assertEquals(eventDate, created.getRaceDate());
        assertEquals(eventDate.plusDays(1), created.getSubmissionDeadline());
        assertEquals(RaceStatus.DRAFT, created.getStatus());
        assertEquals(organizer, created.getOrganizer());
    }

    @Test
    void createRace_customSubmissionDeadline_persistsProvidedDeadline() {
        User superAdmin = new User();
        superAdmin.setEmail("super@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);
        mockAuthUser(superAdmin);

        LocalDateTime eventDate = LocalDateTime.now().plusDays(20);
        LocalDateTime customDeadline = LocalDateTime.now().plusDays(25);
        CreateRaceRequest req = new CreateRaceRequest();
        req.setName("Kisumu 5K");
        req.setDistance("5K");
        req.setRaceDate(eventDate);
        req.setSubmissionDeadline(customDeadline);
        req.setFee(BigDecimal.ZERO);

        when(raceRepository.save(any(Race.class))).thenAnswer(inv -> inv.getArgument(0));

        Race created = raceService.createRace(req, authentication);

        assertEquals(customDeadline, created.getSubmissionDeadline());
    }

    @Test
    void getAdminRaces_superAdmin_returnsAllOrdered() {
        User superAdmin = new User();
        superAdmin.setEmail("super@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);
        mockAuthUser(superAdmin);

        Race r1 = new Race();
        when(raceRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(r1));

        List<Race> races = raceService.getAdminRaces(authentication);
        assertEquals(1, races.size());
        verify(raceRepository).findAllByOrderByCreatedAtDesc();
    }

    @Test
    void getAdminRaces_raceAdmin_returnsOrganizerRaces() {
        User organizer = new User();
        organizer.setId(15);
        organizer.setEmail("organizer@kimbia.africa");
        organizer.setRole(Role.RACE_ADMIN);
        mockAuthUser(organizer);

        Race r1 = new Race();
        when(raceRepository.findByOrganizerIdOrderByCreatedAtDesc(15)).thenReturn(List.of(r1));

        List<Race> races = raceService.getAdminRaces(authentication);
        assertEquals(1, races.size());
        verify(raceRepository).findByOrganizerIdOrderByCreatedAtDesc(15);
    }

    @Test
    void getAdminRaces_runnerRole_throwsSecurityException() {
        User runner = new User();
        runner.setEmail("runner@kimbia.africa");
        runner.setRole(Role.RUNNER);
        mockAuthUser(runner);

        assertThrows(SecurityException.class, () -> raceService.getAdminRaces(authentication));
    }

    @Test
    void updateRace_notFound_throwsIllegalArgumentException() {
        User superAdmin = new User();
        superAdmin.setEmail("super@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);
        mockAuthUser(superAdmin);

        when(raceRepository.findById(999)).thenReturn(Optional.empty());

        UpdateRaceRequest req = new UpdateRaceRequest();
        assertThrows(IllegalArgumentException.class, () -> raceService.updateRace(999, req, authentication));
    }

    @Test
    void updateRace_unauthorizedUser_throwsSecurityException() {
        User organizer1 = new User();
        organizer1.setId(1);

        Race race = new Race();
        race.setId(20);
        race.setOrganizer(organizer1);

        User callerAdmin = new User();
        callerAdmin.setId(2);
        callerAdmin.setEmail("caller@kimbia.africa");
        callerAdmin.setRole(Role.RACE_ADMIN);
        mockAuthUser(callerAdmin);

        when(raceRepository.findById(20)).thenReturn(Optional.of(race));

        UpdateRaceRequest req = new UpdateRaceRequest();
        assertThrows(SecurityException.class, () -> raceService.updateRace(20, req, authentication));
    }

    @Test
    void updateRace_authorizedOrganizer_updatesPartialFields() {
        User organizer = new User();
        organizer.setId(10);
        organizer.setEmail("owner@kimbia.africa");
        organizer.setRole(Role.RACE_ADMIN);
        mockAuthUser(organizer);

        Race race = new Race();
        race.setId(30);
        race.setOrganizer(organizer);
        race.setName("Old Name");
        race.setFee(BigDecimal.valueOf(100));

        when(raceRepository.findById(30)).thenReturn(Optional.of(race));
        when(raceRepository.save(any(Race.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateRaceRequest req = new UpdateRaceRequest();
        req.setName("New Name");
        req.setDistance("21.1K, 42.2K");
        req.setFee(BigDecimal.valueOf(2500));
        LocalDateTime newDate = LocalDateTime.now().plusDays(60);
        req.setRaceDate(newDate);
        req.setSubmissionDeadline(newDate.plusDays(2));
        req.setBibTemplateUrl("http://cdn/newbib.png");
        req.setDescription("Updated description");

        Race updated = raceService.updateRace(30, req, authentication);

        assertEquals("New Name", updated.getName());
        assertEquals("21.1K, 42.2K", updated.getDistance());
        assertEquals(BigDecimal.valueOf(2500), updated.getFee());
        assertEquals(newDate, updated.getRaceDate());
        assertEquals(newDate.plusDays(2), updated.getSubmissionDeadline());
        assertEquals("http://cdn/newbib.png", updated.getBibTemplateUrl());
        assertEquals("Updated description", updated.getDescription());
    }

    @Test
    void updateRaceStatus_nullStatus_throwsIllegalArgumentException() {
        User superAdmin = new User();
        superAdmin.setEmail("super@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);
        mockAuthUser(superAdmin);

        Race race = new Race();
        race.setId(40);
        when(raceRepository.findById(40)).thenReturn(Optional.of(race));

        UpdateRaceStatusRequest req = new UpdateRaceStatusRequest();
        req.setStatus(null);

        assertThrows(IllegalArgumentException.class, () -> raceService.updateRaceStatus(40, req, authentication));
    }

    @Test
    void updateRaceStatus_publishByUnapprovedRaceAdmin_throwsIllegalStateException() {
        User organizer = new User();
        organizer.setId(10);
        organizer.setEmail("unapproved@kimbia.africa");
        organizer.setRole(Role.RACE_ADMIN);
        organizer.setStatus(AccountStatus.PENDING_VETTING);
        mockAuthUser(organizer);

        Race race = new Race();
        race.setId(50);
        race.setOrganizer(organizer);
        when(raceRepository.findById(50)).thenReturn(Optional.of(race));

        UpdateRaceStatusRequest req = new UpdateRaceStatusRequest();
        req.setStatus(RaceStatus.PUBLISHED);

        assertThrows(IllegalStateException.class, () -> raceService.updateRaceStatus(50, req, authentication));
    }

    @Test
    void updateRaceStatus_publishByApprovedRaceAdmin_success() {
        User organizer = new User();
        organizer.setId(10);
        organizer.setEmail("approved@kimbia.africa");
        organizer.setRole(Role.RACE_ADMIN);
        organizer.setStatus(AccountStatus.APPROVED);
        mockAuthUser(organizer);

        Race race = new Race();
        race.setId(60);
        race.setOrganizer(organizer);
        race.setStatus(RaceStatus.DRAFT);
        when(raceRepository.findById(60)).thenReturn(Optional.of(race));
        when(raceRepository.save(any(Race.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateRaceStatusRequest req = new UpdateRaceStatusRequest();
        req.setStatus(RaceStatus.PUBLISHED);

        Race updated = raceService.updateRaceStatus(60, req, authentication);
        assertEquals(RaceStatus.PUBLISHED, updated.getStatus());
    }

    @Test
    void updateRaceStatus_publishBySuperAdmin_success() {
        User superAdmin = new User();
        superAdmin.setEmail("super@kimbia.africa");
        superAdmin.setRole(Role.SUPER_ADMIN);
        mockAuthUser(superAdmin);

        Race race = new Race();
        race.setId(70);
        race.setStatus(RaceStatus.DRAFT);
        when(raceRepository.findById(70)).thenReturn(Optional.of(race));
        when(raceRepository.save(any(Race.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateRaceStatusRequest req = new UpdateRaceStatusRequest();
        req.setStatus(RaceStatus.PUBLISHED);

        Race updated = raceService.updateRaceStatus(70, req, authentication);
        assertEquals(RaceStatus.PUBLISHED, updated.getStatus());
    }
}
