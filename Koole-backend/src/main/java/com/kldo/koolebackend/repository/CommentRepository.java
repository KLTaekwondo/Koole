package com.kldo.koolebackend.repository;

import com.kldo.koolebackend.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.kldo.koolebackend.entity.Comment;

import java.util.Collection;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByArticle(Article article);

    @Query("SELECT c.commentId, c.content, c.createTime, " +
            "u.userId, u.username, " +
            "a.articleId " +
            "FROM Comment c " +
            "JOIN c.user u " +
            "JOIN c.article a " +
            "WHERE a.articleId = :articleId " +
            "ORDER BY c.createTime DESC")
    List<Object[]> findCommentsWithUserAndArticle(@Param("articleId") Long articleId);
}
