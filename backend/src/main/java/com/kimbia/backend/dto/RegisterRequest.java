package com.kimbia.backend.dto;

import com.kimbia.backend.enums.AgeGroup;
import com.kimbia.backend.enums.Gender;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String mobileNumber;
    private AgeGroup ageGroup;
    private Gender gender;
    private String dateOfBirth; // Added this since the user asked about date of birth input field
}
