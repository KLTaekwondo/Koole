package com.kldo.koolebackend.converter;

import com.kldo.koolebackend.dto.user.RegisterByEmailDTO;
import com.kldo.koolebackend.dto.user.RegisterByPhoneDTO;
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
    public static UserInfo covernterToUserinfo(User user){
        return UserInfo.builder()
                .id(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .build();
    }

    /**
     * 将RegisterByEmailDTO转化为User
     * @param registerByEmailDTO
     * @return User
     */
    public static User converterToUserByEmail(RegisterByEmailDTO registerByEmailDTO){
        String username = "用户" + registerByEmailDTO.getEmail();
        return User.builder()
                .username(username)
                .email(registerByEmailDTO.getEmail())
                .password(registerByEmailDTO.getPassword())
                .build();
    }

    /**
     * 将RegisterByPhoneDTO转化为User
     * @param registerByPhoneDTO
     * @return User
     */
    public static User converterToUserByPhone(RegisterByPhoneDTO registerByPhoneDTO){
        String username = "用户" + registerByPhoneDTO.getPhone();
        return User.builder()
                .username(username)
                .phone(registerByPhoneDTO.getPhone())
                .password(registerByPhoneDTO.getPassword())
                .build();
    }
}
