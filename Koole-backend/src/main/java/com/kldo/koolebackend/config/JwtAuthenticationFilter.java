package com.kldo.koolebackend.config;

import com.kldo.koolebackend.exception.BusinessException;
import com.kldo.koolebackend.utils.AuthContext;
import com.kldo.koolebackend.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        try {
            Long userId = AuthContext.getCurrentUserId(request, jwtUtil);
            String role = AuthContext.getCurrentUserRole(request, jwtUtil);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, Collections.singleton(() -> role));

            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (BusinessException e) {
            // 未登录或 token 无效，不做处理，让后续过滤器决定
        }
        chain.doFilter(request, response);
    }
}