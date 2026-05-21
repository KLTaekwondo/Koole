package com.kldo.koolebackend.info;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
public class ArticleDetailInfo extends ArticleInfo {
    private String content;
}
