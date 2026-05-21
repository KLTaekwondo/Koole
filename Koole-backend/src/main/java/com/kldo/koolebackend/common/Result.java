package com.kldo.koolebackend.common;

import lombok.*;

@Setter
@Getter
@Builder
public class Result<T> {
    private int code;
    private String msg;
    private T data;

    //成功响应，包含数据
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMsg("success");
        result.setData(data);
        return result;
    }

    //成功响应，不包含数据
    public static <T> Result<T> successMessage(String msg) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMsg(msg);
        return result;
    }

    //错误响应，返回固定错误码400和详细错误信息
    public static <T> Result<T> errorMessage(String msg) {
        Result<T> result = new Result<>();
        result.setCode(400);
        result.setMsg(msg);
        return result;
    }

    //返回自定义错误码和详细错误信息
    public static <T> Result<T> error(int code, String msg) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMsg(msg);
        return result;
    }
}