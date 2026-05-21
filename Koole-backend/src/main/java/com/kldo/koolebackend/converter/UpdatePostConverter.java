package com.kldo.koolebackend.converter;

import com.kldo.koolebackend.dto.UpdatePostBackDTO;
import com.kldo.koolebackend.entity.UpdatePost;
import com.kldo.koolebackend.info.UpdatePostInfo;

import java.util.Set;
import java.util.stream.Collectors;

public class UpdatePostConverter {
    //禁止实例化
    private UpdatePostConverter() {}

    /**
     * 将UpdatePost实体转换为UpdatePostInfo
     * @param updatePost 更新帖子实体
     * @return 更新帖子信息
     */
    public static UpdatePostInfo convertToInfo(UpdatePost updatePost) {
        return UpdatePostInfo.builder()
                .id(updatePost.getPostId())
                .title(updatePost.getTitle())
                .content(updatePost.getContent())
                .createTime(updatePost.getCreateTime())
                .updateTime(updatePost.getUpdateTime())
                .build();
    }

    public static Set<UpdatePostInfo> convertToSetInfo(Set<UpdatePost> updatePosts) {
        return updatePosts.stream()
                .map(UpdatePostConverter::convertToInfo)
                .collect(Collectors.toSet());
    }

    public static UpdatePost convertToPost(UpdatePostBackDTO updatePostBackDTO) {
        return UpdatePost.builder()
                .title(updatePostBackDTO.getTitle())
                .content(updatePostBackDTO.getContent())
                .build();
    }
}
