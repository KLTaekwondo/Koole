package com.kldo.koolebackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentBackDTO {
    @NotBlank
    @Size(min = 1, max = 100, message = "评论内容长度必须在1到100之间")
    private String content;
}
