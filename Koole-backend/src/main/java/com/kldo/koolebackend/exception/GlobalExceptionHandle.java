package com.kldo.koolebackend.exception;

import com.kldo.koolebackend.common.Result;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GlobalExceptionHandle {
    // 处理用户不存在、密码错误等业务异常
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        return Result.error(e.getCode(), e.getMessage());
    }

    // 处理参数校验失败（如 @NotNull 校验不通过）
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return Result.errorMessage(message);
    }

    // 处理权限不足（比如403 错误）
    @ExceptionHandler(AccessDeniedException.class)
    public Result<?> handleAccessDeniedException() {
        return Result.error(403, "权限不足");
    }

    // 处理 JSON 格式错误（比如前端传的 JSON 少了个引号）
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public Result<?> handleJsonParseException() {
        return Result.errorMessage("请求格式错误");
    }

    // 处理数据库唯一约束冲突（比如用户名重复）
    @ExceptionHandler(DataIntegrityViolationException.class)
    public Result<?> handleDataIntegrityException() {
        return Result.error(409, "数据已存在");
    }

    // 兜底：处理所有没被上面捕获的异常
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        e.printStackTrace(); // 开发时打印，方便排查
        return Result.error(500, "服务器内部错误");
    }

}
