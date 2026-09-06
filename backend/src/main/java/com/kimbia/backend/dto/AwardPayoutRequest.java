package com.kimbia.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AwardPayoutRequest {

    @JsonProperty("user_id")
    @JsonAlias("userId")
    private Integer userId;

    @JsonProperty("registration_id")
    @JsonAlias("registrationId")
    private Integer registrationId;

    @JsonProperty("award_type")
    @JsonAlias("awardType")
    private String awardType;

    @JsonProperty("destination_account")
    @JsonAlias("destinationAccount")
    private String destinationAccount;

    private BigDecimal amount;
}
