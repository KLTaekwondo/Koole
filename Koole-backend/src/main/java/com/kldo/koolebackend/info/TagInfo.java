package com.kldo.koolebackend.info;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TagInfo {
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Long id;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String name;
}
