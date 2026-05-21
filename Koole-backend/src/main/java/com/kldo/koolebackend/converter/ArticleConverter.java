package com.kldo.koolebackend.converter;

import com.kldo.koolebackend.dto.ArticleBackDTO;
import com.kldo.koolebackend.entity.Article;
import com.kldo.koolebackend.entity.Tag;
import com.kldo.koolebackend.entity.User;
import com.kldo.koolebackend.info.ArticleDetailInfo;
import com.kldo.koolebackend.info.ArticleSummaryInfo;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class ArticleConverter {
    // 禁止实例化
    private ArticleConverter() {}

    /**
     * 将文章实体转换为文章详情信息
     * @param article 文章实体
     * @return 文章详情信息
     */
    public static ArticleDetailInfo convertToDetailInfo(Article article) {
        List<Long> tagIds =  article.getTags().stream().map(Tag::getTagId).toList();
        return ArticleDetailInfo.builder()
                .id(article.getArticleId())
                .title(article.getTitle())
                .content(article.getContent())
                .tagIds(tagIds)
                .createTime(article.getCreateTime())
                .updateTime(article.getUpdateTime())
                .build();
    }

    /**
     * 将文章实体列表转换为文章详情信息列表
     * @param articles 文章实体列表
     * @return 文章详情信息列表
     */
    public static List<ArticleDetailInfo> convertToListDetailInfo(List<Article> articles) {
        return articles.stream().map(ArticleConverter::convertToDetailInfo).collect(Collectors.toList());
    }

    /**
     * 将文章实体转换为文章摘要信息
     * @param article 文章实体
     * @return 文章摘要信息
     */

    public static ArticleSummaryInfo convertToSummaryInfo(Article article) {
        List<Long> tagIds =  article.getTags().stream().map(Tag::getTagId).toList();
        return ArticleSummaryInfo.builder()
                .id(article.getArticleId())
                .title(article.getTitle())
                .tagIds(tagIds)
                .summary(article.getSummary())
                .createTime(article.getCreateTime())
                .updateTime(article.getUpdateTime())
                .build();
    }

    /**
     * 将文章实体列表转换为文章摘要信息列表
     * @param articles 文章实体列表
     * @return 文章摘要信息列表
     */
    public static List<ArticleSummaryInfo> convertToListSummaryInfo(List<Article> articles) {
        return articles.stream().map(ArticleConverter::convertToSummaryInfo).collect(Collectors.toList());
    }

    /**
     * 将文章DTO转换为文章实体
     * @param articleBackDTO 文章DTO
     * @param user 用户
     * @return 文章实体
     */
    public static Article convertToArticle(ArticleBackDTO articleBackDTO, User user, Set<Tag> tags) {
        return Article.builder()
                .title(articleBackDTO.getTitle())
                .content(articleBackDTO.getContent())
                .user(user)
                .tags(tags)
                .build();
    }
}
