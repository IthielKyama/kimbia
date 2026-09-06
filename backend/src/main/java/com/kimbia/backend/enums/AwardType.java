package com.kimbia.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum AwardType {
    MONEY, AIRTIME;

    @JsonCreator
    public static AwardType fromString(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toUpperCase();
        if ("MOBILE_MONEY".equals(normalized) || "MONEY".equals(normalized)) {
            return MONEY;
        }
        if ("AIRTIME".equals(normalized)) {
            return AIRTIME;
        }
        throw new IllegalArgumentException("Unknown AwardType: " + value);
    }
}
