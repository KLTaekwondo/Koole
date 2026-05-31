package com.kldo.koolebackend.utils;

import com.kldo.koolebackend.common.LoginUser;
import com.kldo.koolebackend.exception.BusinessException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

public class AuthContext {
    /**
     * 从请求中获取当前登录用户的ID
     * @param request HTTP请求
     * @param jwtUtil JWT工具类
     * @return 用户ID
     * @throws BusinessException 未登录或token无效时抛出
     */
    public static Long getCurrentUserId(HttpServletRequest request, JwtUtil jwtUtil) {
        String token = extractTokenAndValidateFromCookie(request, jwtUtil);
        return jwtUtil.getUserIdFromToken(token);
    }

    /**
     * 从请求中获取当前登录用户的角色（带ROLE_前缀，用于Spring Security）
     * @param request HTTP请求
     * @param jwtUtil JWT工具类
     * @return 角色（ROLE_USER 或 ROLE_ADMIN）
     * @throws BusinessException 未登录或token无效时抛出
     */
    public static String getCurrentUserRole(HttpServletRequest request, JwtUtil jwtUtil) {
        String token = extractTokenAndValidateFromCookie(request, jwtUtil);
        return jwtUtil.getRoleFromToken(token);
    }

    /**
     * 从请求中获取当前登录用户的信息（包含用户名和角色）
     * @param request HTTP请求
     * @param jwtUtil JWT工具类
     * @return LoginUser对象，包含用户名和角色
     * @throws BusinessException 未登录或token无效时抛出
     */
    public static LoginUser getCurrentUser(HttpServletRequest request, JwtUtil jwtUtil) {
        String token = extractTokenAndValidateFromCookie(request, jwtUtil);
        return LoginUser.builder()
                .userId(jwtUtil.getUserIdFromToken(token))
                .role(jwtUtil.getRoleFromToken(token))
                .build();
    }

    /**
     * 从Cookie中提取token
     * @param request HTTP请求
     * @return token字符串，如果没有则返回null
     */
    private static String extractTokenAndValidateFromCookie(HttpServletRequest request, JwtUtil jwtUtil) {
        Cookie[] cookies = request.getCookies();
        String token = null;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        //自动检验token是否为空或过期
        if (token == null) {
            throw new BusinessException(401, "未登录，请先登录");
        }
        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(401, "token过期，请重新登录");
        }

        return token;
    }
}
