package com.kldo.koolebackend.controller;

import com.kldo.koolebackend.common.Result;
import com.kldo.koolebackend.dto.UpdatePostBackDTO;
import com.kldo.koolebackend.entity.UpdatePost;
import com.kldo.koolebackend.info.UpdatePostInfo;
import com.kldo.koolebackend.service.UpdatePostService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/updatepost")
public class UpdatePostController {
    @Autowired
    private UpdatePostService updatePostService;

    /**
     * 获取所有更新帖子
     * @return 更新帖子列表
     */
    @GetMapping("/getAll")
    public Result<List<UpdatePostInfo>> findAll() {
        return Result.success(updatePostService.findAll());
    }

    /**
     * 获取指定更新帖子
     * @param id 更新帖子ID
     * @return 更新帖子信息
     */
    @GetMapping("/getById/{id}")
    public Result<UpdatePostInfo> findById(@PathVariable Long id) {
        return Result.success(updatePostService.findById(id));
    }

    /**
     * 创建更新帖子
     * @param updatePostBackDTO 更新帖子信息
     * @return 创建结果
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public Result<Void> create(@RequestBody UpdatePostBackDTO updatePostBackDTO , Authentication authentication) {
        updatePostService.create(updatePostBackDTO);
        return Result.successMessage("创建成功");
    }

    /**
     * 更新更新帖子
     * @param updatePostBackDTO 更新帖子信息
     * @return 更新结果
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody UpdatePostBackDTO updatePostBackDTO) {
        updatePostService.update(id, updatePostBackDTO);
        return Result.successMessage("更新成功");
    }

    /**
     * 删除更新帖子
     * @param id 更新帖子ID
     * @return 删除结果
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        updatePostService.delete(id);
        return Result.successMessage("删除成功");
    }
}
