package com.kldo.koolebackend.common;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginUser {
    private Long userId;
    private String role;
}
