package com.kldo.koolebackend.converter;

import com.kldo.koolebackend.dto.CommentBackDTO;
import com.kldo.koolebackend.entity.Article;
import com.kldo.koolebackend.entity.Comment;
import com.kldo.koolebackend.entity.User;
import com.kldo.koolebackend.info.CommentInfo;

import java.util.Set;

public class CommentConverter {
    //禁止实例化
    private CommentConverter() {}

    public static CommentInfo convertToInfo(Comment comment , User user , Article article) {
        return CommentInfo.builder()
                .id(comment.getCommentId())
                .content(comment.getContent())
                .userId(user.getUserId())
                .articleId(article.getArticleId())
                .username(user.getUsername())
                .createTime(comment.getCreateTime())
                .build();
    }

    public static Comment convertToComment(CommentBackDTO commentBackDTO , User user , Article article) {
        return Comment.builder()
                .content(commentBackDTO.getContent())
                .user(user)
                .article(article)
                .build();
    }
}
