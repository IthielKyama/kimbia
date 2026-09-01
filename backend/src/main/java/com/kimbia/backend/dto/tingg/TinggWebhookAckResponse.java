package com.kimbia.backend.dto.tingg;

public class TinggWebhookAckResponse {
    private String status_code;
    private String checkout_request_id;
    private String receipt_number;
    private String merchant_transaction_id;
    private String status_description;

    public String getStatus_code() { return status_code; }
    public void setStatus_code(String status_code) { this.status_code = status_code; }
    public String getCheckout_request_id() { return checkout_request_id; }
    public void setCheckout_request_id(String checkout_request_id) { this.checkout_request_id = checkout_request_id; }
    public String getReceipt_number() { return receipt_number; }
    public void setReceipt_number(String receipt_number) { this.receipt_number = receipt_number; }
    public String getMerchant_transaction_id() { return merchant_transaction_id; }
    public void setMerchant_transaction_id(String merchant_transaction_id) { this.merchant_transaction_id = merchant_transaction_id; }
    public String getStatus_description() { return status_description; }
    public void setStatus_description(String status_description) { this.status_description = status_description; }
}

