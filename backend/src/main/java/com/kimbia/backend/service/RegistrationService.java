package com.kimbia.backend.service;

import com.kimbia.backend.entity.Registration;
import com.kimbia.backend.repository.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;

    public RegistrationService(RegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    public Optional<Registration> getRegistrationById(Integer id) {
        return registrationRepository.findById(id);
    }

    public List<Registration> getRegistrationsByRaceId(Integer raceId) {
        return registrationRepository.findByRaceId(raceId);
    }
}

