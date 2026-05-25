package com.kldo.koolebackend.enums;

import lombok.Getter;

@Getter
public enum RoleEnum {
    USER("USER", "普通用户"),
    ADMIN("ADMIN", "管理员");

    private String code;
    private String description;
    RoleEnum(String code, String description) {
        this.code = code;
        this.description = description;
    }
}
