package com.kldo.koolebackend.service;

import com.kldo.koolebackend.converter.UpdatePostConverter;
import com.kldo.koolebackend.dto.UpdatePostBackDTO;
import com.kldo.koolebackend.entity.UpdatePost;
import com.kldo.koolebackend.exception.BusinessException;
import com.kldo.koolebackend.info.UpdatePostInfo;
import com.kldo.koolebackend.repository.UpdatePostRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UpdatePostService {
    @Autowired
    private UpdatePostRepository updatePostRepository;

    /**
     * 获取所有更新帖子
     * @return 更新帖子列表
     */
    @Cacheable(value = "updatePostInfoCache",key = "'all'")
    public List<UpdatePostInfo> findAll(){
        return  UpdatePostConverter.convertToListInfo(updatePostRepository.findAll());
    }

    /**
     * 根据ID获取更新帖子
     * @param id 更新帖子ID
     * @return 更新帖子
     */
    @Cacheable(value = "updatePostInfoCache",key = "#id")
    public UpdatePostInfo findById(Long id){
        UpdatePost updatePost = updatePostRepository.findById(id).orElseThrow(() -> new BusinessException("更新帖子不存在"));
        return UpdatePostConverter.convertToInfo(updatePost);
    }

    /**
     * 创建更新帖子
     * @param updatePostBackDTO 更新帖子返回DTO
     */
    @CacheEvict(value = "updatePostInfoCache",key = "'all'")
    @Transactional
    public void create(UpdatePostBackDTO updatePostBackDTO) {
        UpdatePost updatePost = UpdatePostConverter.convertToPost(updatePostBackDTO);
        updatePostRepository.save(updatePost);
    }

    /**
     * 更新更新帖子
     * @param id 更新帖子ID
     * @param updatePostBackDTO 更新帖子返回DTO
     */
    @Caching(evict = {
            @CacheEvict(value = "updatePostInfoCache",key = "#id"),
            @CacheEvict(value = "updatePostInfoCache",key = "'all'")
    })
    @Transactional
    public void update(Long id, UpdatePostBackDTO updatePostBackDTO) {
        UpdatePost updatePost = updatePostRepository.findById(id).orElseThrow(() -> new BusinessException("更新帖子不存在"));
        UpdatePostConverter.setPost(updatePostBackDTO, updatePost);
        updatePostRepository.save(updatePost);
    }

    /**
     * 删除更新帖子
     * @param id 更新帖子ID
     */
    @Caching(evict = {
            @CacheEvict(value = "updatePostInfoCache",key = "#id"),
            @CacheEvict(value = "updatePostInfoCache",key = "'all'")
    })
    @Transactional
    public void delete(Long id) {
        if(!updatePostRepository.existsById(id)){
            throw new BusinessException("更新帖子不存在");
        }
        updatePostRepository.deleteById(id);
    }
}
