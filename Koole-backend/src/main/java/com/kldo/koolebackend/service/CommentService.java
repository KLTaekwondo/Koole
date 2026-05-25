package com.kldo.koolebackend.service;

import com.kldo.koolebackend.common.LoginUser;
import com.kldo.koolebackend.converter.CommentConverter;
import com.kldo.koolebackend.dto.CommentBackDTO;
import com.kldo.koolebackend.entity.Article;
import com.kldo.koolebackend.entity.Comment;
import com.kldo.koolebackend.entity.User;
import com.kldo.koolebackend.exception.BusinessException;
import com.kldo.koolebackend.info.CommentInfo;
import com.kldo.koolebackend.repository.ArticleRepository;
import com.kldo.koolebackend.repository.CommentRepository;
import com.kldo.koolebackend.repository.TagRepository;
import com.kldo.koolebackend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private ArticleRepository articleRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CacheManager cacheManager;

    /**
     * 根据文章ID查询评论
     * @return 评论信息
     */
    @Cacheable(value = "commentInfoCache",key = "#articleId")
    public List<CommentInfo> findAllByArticle(Long articleId) {
        if (!articleRepository.existsById(articleId)) {
            throw new BusinessException("文章不存在");
        }
        return CommentConverter.convertToListInfo(commentRepository.findCommentsWithUserAndArticle(articleId));
    }

    /**
     * 创建评论
     * @param commentBackDTO 评论返回DTO
     * @param userId 用户ID
     * @param articleId 文章ID
     */
    @CacheEvict(value = "commentInfoCache",key = "#articleId")
    @Transactional
    public void create(CommentBackDTO commentBackDTO, Long userId, Long articleId ) {
        Article article = articleRepository.findById(articleId).orElseThrow(() -> new BusinessException("文章不存在"));
        User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException("用户不存在"));

        Comment comment = CommentConverter.convertToComment(commentBackDTO, user, article);
        commentRepository.save(comment);
    }

    /**
     * 删除评论
     * @param commentId 评论ID
     */
    @Transactional
    public void delete(LoginUser loginUser, Long commentId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new BusinessException("评论不存在"));
        Long articleId = comment.getArticle().getArticleId();
        // 删除评论
        boolean isOwner = comment.getUser().getUserId().equals(loginUser.getUserId());
        boolean isAdmin = "ROLE_ADMIN".equals(loginUser.getRole());
        if (!isOwner && !isAdmin) {
            throw new BusinessException("您没有权限删除该评论");
        }
        commentRepository.deleteById(commentId);

        // 清空缓存
        cacheManager.getCache("commentInfoCache").evict(articleId);
    }

}
