package com.kimbia.backend.dto.tingg;

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
public class TinggPayoutPayload {

    @JsonProperty("service_code")
    private String service_code;

    @JsonProperty("client_id")
    private String client_id;

    @JsonProperty("merchant_transaction_id")
    private String merchant_transaction_id;

    @JsonProperty("account_number")
    private String account_number;

    @JsonProperty("currency_code")
    private String currency_code;

    @JsonProperty("amount")
    private BigDecimal amount;

    @JsonProperty("msisdn")
    private String msisdn;

    @JsonProperty("country_code")
    private String country_code;

    @JsonProperty("customer_name")
    private String customer_name;

    @JsonProperty("callback_url")
    private String callback_url;

    @JsonProperty("narrative")
    private String narrative;
}
