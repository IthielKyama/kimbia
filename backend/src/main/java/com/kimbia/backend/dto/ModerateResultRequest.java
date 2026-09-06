package com.kimbia.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.kimbia.backend.enums.ModerationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ModerateResultRequest {

    @JsonProperty("moderation_status")
    @JsonAlias("moderationStatus")
    private ModerationStatus moderationStatus;
}
