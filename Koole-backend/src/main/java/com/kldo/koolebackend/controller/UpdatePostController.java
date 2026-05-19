package com.kldo.koolebackend.controller;

import com.kldo.koolebackend.entity.UpdatePost;
import com.kldo.koolebackend.service.UpdatePostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/updatepost")
@CrossOrigin("http://localhost:5173")
public class UpdatePostController {
    @Autowired
    private UpdatePostService updatePostService;

    @GetMapping("/findAll")
    public List<UpdatePost> findAll(){
        return updatePostService.findAll();
    }

    @GetMapping
    public UpdatePost findById(@RequestParam Long id){
        return updatePostService.findById(id);
    }

    @PostMapping
    public void create(@RequestBody UpdatePost updatePost){
        updatePostService.create(updatePost);
    }

    @PutMapping
    public void update(@RequestBody UpdatePost updatePost){
        updatePostService.update(updatePost);
    }

    @DeleteMapping
    public void delete(@RequestParam Long id){
        updatePostService.delete(id);
    }

}
