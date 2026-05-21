package com.kldo.koolebackend.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final Integer code;

    public BusinessException(Integer code, String msg) {
        super(msg);
        this.code = code;
    }

    public BusinessException(String msg) {
        super(msg);
        this.code = 400;
    }
}