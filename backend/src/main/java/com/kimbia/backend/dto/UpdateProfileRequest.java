package com.kimbia.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.kimbia.backend.enums.AgeGroup;
import com.kimbia.backend.enums.Gender;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;

    @JsonProperty("mobile_number")
    @JsonAlias({"mobileNumber", "phone"})
    private String mobileNumber;

    @JsonProperty("age_group")
    @JsonAlias("ageGroup")
    private AgeGroup ageGroup;

    private Gender gender;

    @JsonProperty("avatar_url")
    @JsonAlias("avatarUrl")
    private String avatarUrl;

    @JsonProperty("date_of_birth")
    @JsonAlias("dateOfBirth")
    private String dateOfBirth;
}
