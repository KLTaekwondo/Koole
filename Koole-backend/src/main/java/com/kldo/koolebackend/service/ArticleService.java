package com.kldo.koolebackend.service;

import com.kldo.koolebackend.common.LoginUser;
import com.kldo.koolebackend.converter.ArticleConverter;
import com.kldo.koolebackend.dto.ArticleBackDTO;
import com.kldo.koolebackend.entity.Article;
import com.kldo.koolebackend.entity.Tag;
import com.kldo.koolebackend.entity.User;
import com.kldo.koolebackend.enums.RoleEnum;
import com.kldo.koolebackend.exception.BusinessException;
import com.kldo.koolebackend.info.ArticleDetailInfo;
import com.kldo.koolebackend.info.ArticleSummaryInfo;
import com.kldo.koolebackend.repository.ArticleRepository;


import com.kldo.koolebackend.repository.TagRepository;
import com.kldo.koolebackend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ArticleService {
    @Autowired
    private ArticleRepository articleRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TagRepository tagRepository;
    @Autowired
    private CacheManager cacheManager;

    /**
     * 获取所有文章摘要
     *
     * @return 所有文章摘要列表
     */
    @Cacheable(value = "articleSummaryCache", key = "'allSummary'")
    public List<ArticleSummaryInfo> findAllSummary() {
        return ArticleConverter.convertToListSummaryInfo(articleRepository.findAll());
    }

    /**
     * 获取标签文章摘要列表
     *
     * @return 所有文章摘要列表
     */
    @Cacheable(value = "articleSummaryCache", key = "#tagId")
    public List<ArticleSummaryInfo> findByTagId(Long tagId) {
        return ArticleConverter.convertToListSummaryInfo(articleRepository.findByTagId(tagId));
    }

    /**
     * 获取文章具体内容
     *
     * @return 所有文章具体内容
     */
    @Cacheable(value = "articleContentCache", key = "#articleId")
    public ArticleDetailInfo findArticleById(Long articleId) {
        Article article = articleRepository.findById(articleId).orElseThrow(() -> new BusinessException("不存在的文章！"));
        return ArticleConverter.convertToDetailInfo(article);
    }

    /**
     * 创建文章
     *
     * @param articleBackDTO 文章信息
     * @param userId         用户ID
     */
    @Caching(evict = {
            @CacheEvict(value = "articleSummaryCache", key = "'allSummary'"),
            @CacheEvict(value = "articleSummaryCache", key = "#tagId")
    })
    @Transactional
    public void create(ArticleBackDTO articleBackDTO, Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException("不存在的用户！"));
        Set<Tag> tags = null;
        if (articleBackDTO.getTagIds() != null && !articleBackDTO.getTagIds().isEmpty()) {
            List<Tag> tagsList = tagRepository.findAllById(articleBackDTO.getTagIds());
            if (tagsList.size() != articleBackDTO.getTagIds().size()) {
                throw new BusinessException("部分标签不存在");
            }
            tags = new HashSet<>(tagsList);
        }
        Article article = ArticleConverter.convertToArticle(articleBackDTO, user, tags);
        articleRepository.save(article);
    }


    /**
     * 更新文章
     *
     * @param articleId      文章ID
     * @param articleBackDTO 文章信息
     * @param loginUser      用户信息
     */
    @Caching(evict = {
            @CacheEvict(value = "articleSummaryCache", key = "'allSummary'"),
            @CacheEvict(value = "articleSummaryCache", key = "#tagId"),
            @CacheEvict(value = "articleContentCache", key = "#articleId")
    })
    @Transactional
    public void update(Long articleId, ArticleBackDTO articleBackDTO, LoginUser loginUser) {
        Article article = articleRepository.findById(articleId).orElseThrow(() -> new BusinessException("不存在的文章！"));

        boolean isAuthor = article.getUser().getUserId().equals(loginUser.getUserId());
        boolean isAdmin = "ROLE_ADMIN".equals(loginUser.getRole());
        // 检查是否是文章作者
        if (!isAuthor && !isAdmin) {
            throw new BusinessException("您没有权限更新该文章！");
        }

        Set<Tag> tags = null;
        if (articleBackDTO.getTagIds() != null && !articleBackDTO.getTagIds().isEmpty()) {
            List<Tag> tagsList = tagRepository.findAllById(articleBackDTO.getTagIds());
            if (tagsList.size() != articleBackDTO.getTagIds().size()) {
                throw new BusinessException("部分标签不存在");
            }
            tags = new HashSet<>(tagsList);
        }
        ArticleConverter.setArticle(articleBackDTO, article, tags);
        articleRepository.save(article);
    }

    /**
     * 删除文章
     * @param articleId 文章ID
     */
    @Transactional
    public void delete(Long articleId, LoginUser loginUser) {
        // 检查文章是否存在
        Article article = articleRepository.findById(articleId).orElseThrow(() -> new BusinessException("不存在的文章！"));
        boolean isAuthor = article.getUser().getUserId().equals(loginUser.getUserId());
        boolean isAdmin = ("ROLE_" + RoleEnum.ADMIN.getCode()).equals(loginUser.getRole());
        Set<Long> tagIds = article.getTags().stream().map(Tag::getTagId).collect(Collectors.toSet());

        // 检查是否是文章作者
        if (!isAuthor && !isAdmin) {
            throw new BusinessException("您没有权限删除该文章！");
        }
        articleRepository.deleteById(articleId);
        // 清空缓存

        cacheManager.getCache("articleSummaryCache").evict("allSummary");
        cacheManager.getCache("articleContentCache").evict(articleId);
        for(Long tagId : tagIds) {
            cacheManager.getCache("articleSummaryCache").evict(tagId);
        }
    }
}