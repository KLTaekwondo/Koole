package com.kldo.koolebackend.controller;

import com.kldo.koolebackend.common.LoginUser;
import com.kldo.koolebackend.common.Result;
import com.kldo.koolebackend.dto.CommentBackDTO;
import com.kldo.koolebackend.info.CommentInfo;
import com.kldo.koolebackend.service.CommentService;
import com.kldo.koolebackend.utils.AuthContext;
import com.kldo.koolebackend.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comment")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {
    @Autowired
    private CommentService commentService;
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 根据文章ID查询评论
     * @param articleId 文章ID
     * @return List<CommentInfo>
     */
    @GetMapping("/getAll/{articleId}")
    public Result<List<CommentInfo>> getAllComments(@PathVariable Long articleId){
        return Result.success(commentService.findAllByArticle(articleId));
    }


    /**
     * 创建评论
     * @param commentBackDTO 评论返回DTO
     * @param articleId 文章ID
     */
    @PostMapping("/create/{articleId}")
    public Result<Void> createComment(@RequestBody CommentBackDTO commentBackDTO,
                              @PathVariable Long articleId,
                              HttpServletRequest request){
        LoginUser loginUser = AuthContext.getCurrentUser(request , jwtUtil);
        commentService.create(commentBackDTO, loginUser.getUserId(), articleId);
        return Result.successMessage("评论创建成功");
    }

    /**
     * 删除评论
     * @param commentId 评论ID
     */
    @DeleteMapping("/delete/{commentId}")
    public Result<Void> deleteComment(@PathVariable Long commentId , HttpServletRequest request){
        LoginUser loginUser = AuthContext.getCurrentUser(request , jwtUtil);
        commentService.delete(loginUser, commentId);
        return Result.successMessage("评论删除成功");
    }
}
