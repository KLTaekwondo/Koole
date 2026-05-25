package com.kldo.koolebackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdatePostBackDTO {
    @NotBlank(message = "标题不能为空")
    @NotNull(message = "标题不能为空")
    @Size(min = 1, max = 20, message = "标题长度必须在1到20之间")
    private String title;

    @NotBlank(message = "内容不能为空")
    @NotNull(message = "内容不能为空")
    private String content;
}
