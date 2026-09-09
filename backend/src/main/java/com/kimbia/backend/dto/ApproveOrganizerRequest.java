package com.kimbia.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ApproveOrganizerRequest {

    @JsonProperty("tingg_service_code")
    private String tinggServiceCode;

    @JsonProperty("tinggServiceCode")
    public void setCamelTinggServiceCode(String code) {
        if (this.tinggServiceCode == null) {
            this.tinggServiceCode = code;
        }
    }

    @JsonProperty("tinggAccountId")
    public void setTinggAccountId(String code) {
        if (this.tinggServiceCode == null) {
            this.tinggServiceCode = code;
        }
    }
}
