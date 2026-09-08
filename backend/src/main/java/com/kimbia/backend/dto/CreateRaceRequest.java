package com.kimbia.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateRaceRequest {

    private String name;

    private String distance;

    @JsonProperty("race_date")
    @JsonAlias("raceDate")
    @JsonFormat(pattern = "yyyy-MM-dd['T'][ ]HH:mm[:ss][.SSS][XXX][X]")
    private LocalDateTime raceDate;

    private BigDecimal fee;

    @JsonProperty("submission_deadline")
    @JsonAlias("submissionDeadline")
    @JsonFormat(pattern = "yyyy-MM-dd['T'][ ]HH:mm[:ss][.SSS][XXX][X]")
    private LocalDateTime submissionDeadline;

    @JsonProperty("bib_template_url")
    @JsonAlias("bibTemplateUrl")
    private String bibTemplateUrl;

    private String description;
}
