package com.kimbia.backend.dto;

public class RegistrationStatusResponse {
    private String status;
    private String paymentStatus;
    private String bibNumber;
    private String bibImgUrl;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getBibNumber() { return bibNumber; }
    public void setBibNumber(String bibNumber) { this.bibNumber = bibNumber; }
    public String getBibImgUrl() { return bibImgUrl; }
    public void setBibImgUrl(String bibImgUrl) { this.bibImgUrl = bibImgUrl; }
}

