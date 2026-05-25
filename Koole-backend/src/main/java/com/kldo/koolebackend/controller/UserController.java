package com.kldo.koolebackend.controller;

import com.kldo.koolebackend.common.LoginUser;
import com.kldo.koolebackend.common.Result;
import com.kldo.koolebackend.dto.user.LoginDTO;
import com.kldo.koolebackend.dto.user.RegisterByEmailDTO;
import com.kldo.koolebackend.dto.user.RegisterByPhoneDTO;
import com.kldo.koolebackend.dto.user.UserPasswordDTO;
import com.kldo.koolebackend.entity.User;
import com.kldo.koolebackend.info.UserInfo;
import com.kldo.koolebackend.service.UserService;
import com.kldo.koolebackend.utils.AuthContext;
import com.kldo.koolebackend.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("http://localhost:5173")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 登录
     * @param loginDTO 登录DTO
     * @param response HTTP响应
     * @return UserInfo
     */
    @PostMapping("/login")
    public Result<UserInfo> getCurrentUser(@RequestBody LoginDTO loginDTO, HttpServletResponse response) {
        UserInfo userInfo = userService.login(loginDTO.getAccount(), loginDTO.getPassword(), response);
        return Result.success(userInfo);
    }

    /**
     * 登出
     * @param response HTTP响应
     * @return Void
     */
    @PostMapping("/logout")
    public Result<Void> logout(HttpServletResponse response) {
        userService.logout(response);
        return Result.successMessage("登出成功");
    }

    /**
     * 查询用户信息
     * @param request HTTP请求
     * @return UserInfo
     */
    @GetMapping("/current")
    public Result<UserInfo> getCurrentUser(HttpServletRequest request) {
        LoginUser loginUser = AuthContext.getCurrentUser(request, jwtUtil);
        UserInfo userInfo = userService.getCurrentUser(loginUser);
        return Result.success(userInfo);
    }

    /**
     * 手机号注册
     * @param registerByPhoneDTO 手机号注册DTO
     * @return Void
     */
    @PostMapping("/registerByPhone")
    public Result<Void> registerByPhone(@RequestBody RegisterByPhoneDTO registerByPhoneDTO) {
        userService.RegisterByPhone(registerByPhoneDTO);
        return Result.successMessage("注册成功");
    }

    /**
     * 邮箱注册
     * @param registerByEmailDTO 邮箱注册DTO
     * @return Void
     */
    @PostMapping("/registerByEmail")
    public Result<Void> registerByEmail(@RequestBody RegisterByEmailDTO registerByEmailDTO) {
        userService.RegisterByEmail(registerByEmailDTO);
        return Result.successMessage("注册成功");
    }

    /**
     * 更新密码
     * @param updatePasswordDTO 更新密码DTO
     * @param request HTTP请求
     * @return Void
     */
    @PutMapping("/updatePassword")
    public Result<Void> updatePassword(@RequestBody UserPasswordDTO updatePasswordDTO, HttpServletRequest request) {
        LoginUser loginUser = AuthContext.getCurrentUser(request, jwtUtil);
        userService.updatePassword(updatePasswordDTO, loginUser);
        return Result.successMessage("密码更新成功");
    }
}
