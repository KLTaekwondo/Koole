package com.kldo.koolebackend.service;

import com.kldo.koolebackend.common.LoginUser;
import com.kldo.koolebackend.converter.UserConverter;
import com.kldo.koolebackend.dto.user.RegisterByEmailDTO;
import com.kldo.koolebackend.dto.user.RegisterByPhoneDTO;
import com.kldo.koolebackend.dto.user.UserPasswordDTO;
import com.kldo.koolebackend.entity.User;
import com.kldo.koolebackend.exception.BusinessException;
import com.kldo.koolebackend.info.UserInfo;
import com.kldo.koolebackend.repository.UserRepository;
import com.kldo.koolebackend.utils.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService{
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 登录
     * @param account 账号
     * @param password 密码
     * @return UserInfo
     */
    public UserInfo login(String account , String password , HttpServletResponse response) {
        // 根据账号查询用户
        User user = userRepository.findByUsernameOrEmailOrPhone(account).orElseThrow(() -> new BusinessException("用户不存在"));

        // 校验密码
        if(!user.getPassword().equals(password)){
            throw new BusinessException("密码错误");
        }

        // 生成token
        String role = user.getRole().getCode();
        String token = jwtUtil.generateToken(user.getUserId(), role);

        Cookie cookie = new Cookie("token", token);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60 * 24);
        cookie.setSecure(false);
        cookie.setHttpOnly(true);
        response.addCookie(cookie);

        // 返回用户信息
        return UserConverter.covernterToUserinfo(user);
    }

    /**
     * 邮箱注册
     * @param registerByEmailDTO 注册DTO
     */
    @Transactional
    public void RegisterByEmail(RegisterByEmailDTO registerByEmailDTO) {
        // 校验邮箱是否存在
        if(userRepository.findByEmail(registerByEmailDTO.getEmail()).isPresent()){
            throw new BusinessException("邮箱已存在");
        }
        // 保存用户
        userRepository.save(UserConverter.converterToUserByEmail(registerByEmailDTO));
    }

    /**
     * 手机号注册
     * @param registerByPhoneDTO 注册DTO
     */
    @Transactional
    public void RegisterByPhone(RegisterByPhoneDTO registerByPhoneDTO) {
        if(userRepository.findByPhone(registerByPhoneDTO.getPhone()).isPresent()){
            throw new BusinessException("手机号已存在");
        }
        // 保存用户
        userRepository.save(UserConverter.converterToUserByPhone(registerByPhoneDTO));
    }

    /**
     * 登出
     * @param response HTTP响应
     */
    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", null);
        cookie.setPath("/");
        cookie.setMaxAge(0);  // 立即过期
        cookie.setHttpOnly(true);
        response.addCookie(cookie);
    }

    /**
     * 查询用户信息
     * @param loginUser 用户信息
     * @return UserInfo
     */
    public UserInfo getCurrentUser(LoginUser loginUser) {
        Long userId = loginUser.getUserId();
        return UserConverter.covernterToUserinfo(userRepository.findById(userId).orElseThrow(() -> new BusinessException("用户不存在")));
    }

    /**
     * 更新用户密码
     * @param userPasswordDTO 用户密码DTO
     */
    @Transactional
    public void updatePassword(UserPasswordDTO userPasswordDTO, LoginUser loginUser) {
        Long userId = loginUser.getUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException("用户不存在"));
        // 校验旧密码是否正确
        if(!user.getPassword().equals(userPasswordDTO.getOldPassword())){
            throw new BusinessException("旧密码错误");
        }

        if(user.getPassword().equals(userPasswordDTO.getNewPassword())){
            throw new BusinessException("新密码不能与旧密码相同");
        }
        // 更新密码
        user.setPassword(userPasswordDTO.getNewPassword());
        userRepository.save(user);
    }
}
