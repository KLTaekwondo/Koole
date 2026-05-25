package com.kldo.koolebackend.converter;

import com.kldo.koolebackend.entity.Tag;
import com.kldo.koolebackend.info.TagInfo;

import java.util.List;
import java.util.Set;

public class TagConverter {
    //禁止实例化
    private TagConverter() {}

    public static TagInfo convertToInfo(Tag tag) {
        return TagInfo.builder()
                .id(tag.getTagId())
                .name(tag.getTagName())
                .build();
    }

    public static List<TagInfo> convertToListInfo(List<Tag> tags) {
        return tags.stream()
                .map(TagConverter::convertToInfo)
                .toList();
    }
}
