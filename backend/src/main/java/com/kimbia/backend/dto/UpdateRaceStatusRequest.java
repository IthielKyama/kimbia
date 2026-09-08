package com.kimbia.backend.dto;

import com.kimbia.backend.enums.RaceStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRaceStatusRequest {

    private RaceStatus status;
}
