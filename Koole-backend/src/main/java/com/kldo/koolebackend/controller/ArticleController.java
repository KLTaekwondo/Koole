package com.kldo.koolebackend.controller;

import com.kldo.koolebackend.common.LoginUser;
import com.kldo.koolebackend.common.Result;
import com.kldo.koolebackend.dto.ArticleBackDTO;
import com.kldo.koolebackend.info.ArticleDetailInfo;
import com.kldo.koolebackend.info.ArticleSummaryInfo;
import com.kldo.koolebackend.service.ArticleService;
import com.kldo.koolebackend.utils.AuthContext;
import com.kldo.koolebackend.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/article")
@CrossOrigin("http://localhost:5173")
public class ArticleController {
    @Autowired
    private ArticleService articleService;
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 获取所有文章摘要
     */
    @GetMapping("/getallSummary")
    public Result<List<ArticleSummaryInfo>> getAllArticlesSummary() {
        return Result.success(articleService.findAllSummary());
    }

    /**
     * 获取标签ID下的文章摘要
     */
    @GetMapping("/getTagSummary/{tagId}")
    public Result<List<ArticleSummaryInfo>> getTagArticlesSummary(@PathVariable Long tagId) {
        return Result.success(articleService.findByTagId(tagId));
    }

    /**
     * 获取文章详情
     * @param articleId 文章ID
     * @return 文章详情
     */
    @GetMapping("/getDetail/{articleId}")
    public Result<ArticleDetailInfo> getArticleDetail(@PathVariable Long articleId) {
        return Result.success(articleService.findArticleById(articleId));
    }

    /**
     * 创建文章
     * @param articleBackDTO 文章创建DTO
     * @param request HttpServletRequest
     * @return 创建结果
     */
    @PostMapping("/create")
    public Result<Void> createArticle(@RequestBody ArticleBackDTO articleBackDTO , HttpServletRequest request) {
        LoginUser loginUser = AuthContext.getCurrentUser(request,jwtUtil);
        articleService.create(articleBackDTO, loginUser.getUserId());
        return Result.successMessage("文章创建成功");
    }


    /**
     * 更新文章
     * @param articleBackDTO 文章更新DTO
     * @param request HttpServletRequest
     * @return 更新结果
     */
    @PutMapping("/update/{articleId}")
    public Result<Void> updateArticle(@PathVariable Long articleId, @RequestBody ArticleBackDTO articleBackDTO, HttpServletRequest request) {
        LoginUser loginUser = AuthContext.getCurrentUser(request,jwtUtil);
        articleService.update(articleId, articleBackDTO, loginUser);
        return Result.successMessage("文章更新成功");
    }

    /**
     * 删除文章
     * @param articleId 文章ID
     * @param request HttpServletRequest
     * @return 删除结果
     */
    @DeleteMapping("/delete/{articleId}")
    public Result<Void> deleteArticle(@PathVariable Long articleId, HttpServletRequest request) {
        LoginUser loginUser = AuthContext.getCurrentUser(request,jwtUtil);
        articleService.delete(articleId, loginUser);
        return Result.successMessage("文章删除成功");
    }


}
