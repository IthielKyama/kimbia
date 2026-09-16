package com.kimbia.backend.dto.tingg;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TinggCheckoutResponse {
    private Object status;
    private Object results;
    private String message;

    public Object getStatus() { return status; }
    public void setStatus(Object status) { this.status = status; }
    public Object getResults() { return results; }
    public void setResults(Object results) { this.results = results; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Status {
        private Integer status_code;
        private String status_description;
        public Integer getStatus_code() { return status_code; }
        public void setStatus_code(Integer status_code) { this.status_code = status_code; }
        public String getStatus_description() { return status_description; }
        public void setStatus_description(String status_description) { this.status_description = status_description; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Results {
        private String short_url;
        private String long_url;
        public String getShort_url() { return short_url; }
        public void setShort_url(String short_url) { this.short_url = short_url; }
        public String getLong_url() { return long_url; }
        public void setLong_url(String long_url) { this.long_url = long_url; }
    }
}
