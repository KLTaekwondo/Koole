package com.kldo.koolebackend.controller;

import com.kldo.koolebackend.common.Result;
import com.kldo.koolebackend.info.TagInfo;
import com.kldo.koolebackend.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tag")
public class TagController {
    @Autowired
    private TagService tagService;

    /**
     * 获取所有标签
     * @return List<TagInfo>
     */
    @GetMapping("/getAll")
    public Result<List<TagInfo>> getAllTags(){
        return Result.success(tagService.findAll());
    }

}
