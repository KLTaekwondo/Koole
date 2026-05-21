package com.kldo.koolebackend.converter;

import com.kldo.koolebackend.dto.RegisterDTO;
import com.kldo.koolebackend.entity.User;
import com.kldo.koolebackend.info.UserInfo;

public class UserConverter {
    // 禁止实例化
    private UserConverter() {}

    /**
     * 将User转化为UserInfo
     * @param user
     * @return UserInfo
     */
    public static UserInfo covernterToUserinfo(User user , String token){
        return UserInfo.builder()
                .id(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .token(token)
                .build();
    }

    public static User covernterToUser(RegisterDTO registerDTO){
        return User.builder()
                .username(registerDTO.getUsername())
                .email(registerDTO.getEmail())
                .phone(registerDTO.getPhone())
                .password(registerDTO.getPassword())
                .build();
    }
}
