package com.kimbia.backend.dto.tingg;

public class TinggWebhookPayload {
    private String merchant_transaction_id;
    private Integer request_status_code;
    private String request_status_description;
    private String checkout_request_id;

    public String getMerchant_transaction_id() { return merchant_transaction_id; }
    public void setMerchant_transaction_id(String merchant_transaction_id) { this.merchant_transaction_id = merchant_transaction_id; }
    public Integer getRequest_status_code() { return request_status_code; }
    public void setRequest_status_code(Integer request_status_code) { this.request_status_code = request_status_code; }
    public String getRequest_status_description() { return request_status_description; }
    public void setRequest_status_description(String request_status_description) { this.request_status_description = request_status_description; }
    public String getCheckout_request_id() { return checkout_request_id; }
    public void setCheckout_request_id(String checkout_request_id) { this.checkout_request_id = checkout_request_id; }
}

