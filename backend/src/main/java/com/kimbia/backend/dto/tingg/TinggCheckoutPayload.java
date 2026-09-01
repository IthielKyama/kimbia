package com.kimbia.backend.dto.tingg;

public class TinggCheckoutPayload {
    private String customer_first_name;
    private String customer_last_name;
    private String msisdn;
    private String account_number;
    private String request_amount;
    private String merchant_transaction_id;
    private String service_code;
    private String country_code;
    private String currency_code;
    private String callback_url;
    private String fail_redirect_url;
    private String success_redirect_url;

    // Getters and Setters
    public String getCustomer_first_name() { return customer_first_name; }
    public void setCustomer_first_name(String customer_first_name) { this.customer_first_name = customer_first_name; }
    public String getCustomer_last_name() { return customer_last_name; }
    public void setCustomer_last_name(String customer_last_name) { this.customer_last_name = customer_last_name; }
    public String getMsisdn() { return msisdn; }
    public void setMsisdn(String msisdn) { this.msisdn = msisdn; }
    public String getAccount_number() { return account_number; }
    public void setAccount_number(String account_number) { this.account_number = account_number; }
    public String getRequest_amount() { return request_amount; }
    public void setRequest_amount(String request_amount) { this.request_amount = request_amount; }
    public String getMerchant_transaction_id() { return merchant_transaction_id; }
    public void setMerchant_transaction_id(String merchant_transaction_id) { this.merchant_transaction_id = merchant_transaction_id; }
    public String getService_code() { return service_code; }
    public void setService_code(String service_code) { this.service_code = service_code; }
    public String getCountry_code() { return country_code; }
    public void setCountry_code(String country_code) { this.country_code = country_code; }
    public String getCurrency_code() { return currency_code; }
    public void setCurrency_code(String currency_code) { this.currency_code = currency_code; }
    public String getCallback_url() { return callback_url; }
    public void setCallback_url(String callback_url) { this.callback_url = callback_url; }
    public String getFail_redirect_url() { return fail_redirect_url; }
    public void setFail_redirect_url(String fail_redirect_url) { this.fail_redirect_url = fail_redirect_url; }
    public String getSuccess_redirect_url() { return success_redirect_url; }
    public void setSuccess_redirect_url(String success_redirect_url) { this.success_redirect_url = success_redirect_url; }
}

