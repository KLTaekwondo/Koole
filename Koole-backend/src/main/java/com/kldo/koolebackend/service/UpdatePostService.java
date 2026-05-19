package com.kldo.koolebackend.service;

import com.kldo.koolebackend.entity.UpdatePost;
import com.kldo.koolebackend.repository.UpdatePostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UpdatePostService {
    @Autowired
    private UpdatePostRepository updatePostRepository;

    public List<UpdatePost> findAll(){
        return updatePostRepository.findAll();
    }

    public UpdatePost findById(Long id){
        return updatePostRepository.findById(id).orElse(null);
    }

    public void create(UpdatePost updatePost){
        updatePostRepository.save(updatePost);
    }

    public void update(UpdatePost updatePost){
        UpdatePost existingUpdatePost = updatePostRepository.findById(updatePost.getPostId()).orElse(null);
        if(existingUpdatePost != null){
            existingUpdatePost.setTitle(updatePost.getTitle());
            existingUpdatePost.setContent(updatePost.getContent());
            updatePostRepository.save(existingUpdatePost);
        }
    }

    public void delete(Long id) {
        updatePostRepository.deleteById(id);
    }
}
