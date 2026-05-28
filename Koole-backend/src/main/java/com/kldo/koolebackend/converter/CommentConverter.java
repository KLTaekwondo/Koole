package com.kldo.koolebackend.converter;

import com.kldo.koolebackend.dto.CommentBackDTO;
import com.kldo.koolebackend.entity.Article;
import com.kldo.koolebackend.entity.Comment;
import com.kldo.koolebackend.entity.User;
import com.kldo.koolebackend.info.CommentInfo;

import java.time.LocalDateTime;
import java.util.List;

public class CommentConverter {
    //禁止实例化
    private CommentConverter() {}

    public static CommentInfo convertToInfo(Object[] result) {
        Long commentId = (Long) result[0];
        String comment = (String) result[1];
        LocalDateTime createTime = (LocalDateTime) result[2];
        Long userId = (Long) result[3];
        String username = (String) result[4];
        Long articleId = (Long) result[5];
        return CommentInfo.builder()
                .id(commentId)
                .content(comment)
                .userId(userId)
                .articleId(articleId)
                .username(username)
                .createTime(createTime)
                .build();
    }

    public static List<CommentInfo> convertToListInfo(List<Object[]> results) {
        return results.stream()
                .map(CommentConverter::convertToInfo)
                .toList();
    }

    public static Comment convertToComment(CommentBackDTO commentBackDTO , User user , Article article) {
        return Comment.builder()
                .content(commentBackDTO.getContent())
                .user(user)
                .article(article)
                .build();
    }
}
