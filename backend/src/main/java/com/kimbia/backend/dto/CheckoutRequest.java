package com.kimbia.backend.dto;

public class CheckoutRequest {
    private Integer raceId;
    private String returnUrl;
    
    public Integer getRaceId() { return raceId; }
    public void setRaceId(Integer raceId) { this.raceId = raceId; }
    
    public String getReturnUrl() { return returnUrl; }
    public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }
}

