package com.kimbia.backend.dto.tingg;

import com.fasterxml.jackson.annotation.JsonAlias;
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
public class TinggPayoutCallbackPayload {

    @JsonProperty("merchant_transaction_id")
    @JsonAlias({"merchantTransactionId", "merchant_transaction_id", "transaction_reference", "transactionRef"})
    private String merchant_transaction_id;

    @JsonProperty("request_status_code")
    @JsonAlias({"requestStatusCode", "request_status_code", "status_code", "statusCode"})
    private Integer request_status_code;

    @JsonProperty("request_status_description")
    @JsonAlias({"requestStatusDescription", "request_status_description", "status_description", "statusDescription"})
    private String request_status_description;

    @JsonProperty("beep_transaction_id")
    @JsonAlias({"beepTransactionId", "beep_transaction_id"})
    private String beep_transaction_id;

    @JsonProperty("amount")
    private String amount;

    @JsonProperty("receipt_number")
    @JsonAlias({"receiptNumber", "receipt_number"})
    private String receipt_number;
}
