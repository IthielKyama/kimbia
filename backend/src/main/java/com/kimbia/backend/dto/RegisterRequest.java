package com.kimbia.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String mobileNumber;
    private String ageGroup;
    private String gender;
}
