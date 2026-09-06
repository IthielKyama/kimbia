package com.kimbia.backend.dto.tingg;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TinggPayoutResponse {

    @JsonProperty("status_code")
    private String status_code;

    @JsonProperty("status_description")
    private String status_description;

    @JsonProperty("beep_transaction_id")
    private String beep_transaction_id;

    @JsonProperty("merchant_transaction_id")
    private String merchant_transaction_id;
}
