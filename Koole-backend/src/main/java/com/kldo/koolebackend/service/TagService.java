package com.kldo.koolebackend.service;

import com.kldo.koolebackend.converter.TagConverter;
import com.kldo.koolebackend.exception.BusinessException;
import com.kldo.koolebackend.info.TagInfo;
import com.kldo.koolebackend.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TagService {
    @Autowired
    private TagRepository tagRepository;

    /**
     * 根据名称查询标签
     * @return 标签信息
     */
    @Cacheable(value = "tagsCache", key = "'allTags'")
    public List<TagInfo> findAll() {
        return TagConverter.convertToListInfo(tagRepository.findAll());
    }

    /**
     * 根据ID查询标签
     * @param id 标签ID
     * @return 标签信息
     */
    @Cacheable(value = "tagsCache", key = "#id")
    public TagInfo findById(Long id) {
        return TagConverter.convertToInfo(tagRepository.findById(id).orElseThrow(() -> new BusinessException("标签不存在")));
    }


}
