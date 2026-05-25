package com.kldo.koolebackend.converter;

import com.kldo.koolebackend.dto.UpdatePostBackDTO;
import com.kldo.koolebackend.entity.UpdatePost;
import com.kldo.koolebackend.info.UpdatePostInfo;

import java.util.List;
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

    /**
     * 将UpdatePost实体列表转换为UpdatePostInfo列表
     * @param updatePosts 更新帖子实体列表
     * @return 更新帖子信息列表
     */
    public static List<UpdatePostInfo> convertToListInfo(List<UpdatePost> updatePosts) {
        return updatePosts.stream()
                .map(UpdatePostConverter::convertToInfo)
                .toList();
    }

    /**
     * 将UpdatePostBackDTO转换为UpdatePost实体
     * @param updatePostBackDTO 更新帖子返回DTO
     * @return 更新帖子实体
     */
    public static UpdatePost convertToPost(UpdatePostBackDTO updatePostBackDTO) {
        return UpdatePost.builder()
                .title(updatePostBackDTO.getTitle())
                .content(updatePostBackDTO.getContent())
                .build();
    }

    /**
     * 将UpdatePostBackDTO实体的信息更新对应帖子的信息
     * @param updatePostBackDTO 更新帖子返回DTO
     * @param updatePost 更新帖子实体
     */
    public static void setPost(UpdatePostBackDTO updatePostBackDTO, UpdatePost updatePost) {
        // 更新标题，如果标题不为空且与当前标题不同
        if(!updatePost.getTitle().equals(updatePostBackDTO.getTitle())){
            updatePost.setTitle(updatePostBackDTO.getTitle());
        }

        // 更新内容，如果内容不为空且与当前内容不同
        if(!updatePost.getContent().equals(updatePostBackDTO.getContent())){
            updatePost.setContent(updatePostBackDTO.getContent());
        }
    }
}
