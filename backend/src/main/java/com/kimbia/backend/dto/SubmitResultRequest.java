package com.kimbia.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmitResultRequest {

    @JsonProperty("registration_id")
    @JsonAlias("registrationId")
    private Integer registrationId;

    @JsonProperty("finishing_time")
    @JsonAlias("finishingTime")
    private String finishingTime;

    @JsonProperty("proof_image_url")
    @JsonAlias("proofImageUrl")
    private String proofImageUrl;

    @JsonProperty("is_dnf")
    @JsonAlias("isDnf")
    private Boolean isDnf;
}
