package com.kldo.koolebackend.info;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
public class ArticleSummaryInfo extends ArticleInfo {
    private String summary;
}
