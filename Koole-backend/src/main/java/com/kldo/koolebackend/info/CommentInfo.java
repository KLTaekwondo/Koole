package com.kldo.koolebackend.info;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentInfo {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String content;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long userId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long articleId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String username;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime createTime;
}
