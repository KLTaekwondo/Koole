package com.kldo.koolebackend.controller;

import com.kldo.koolebackend.entity.User;
import com.kldo.koolebackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("http://localhost:5173")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public User login(@RequestBody User user){
        userService.login(user.getUsername(), user.getPassword());
        return user;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user){
        userService.register(user);
        return user;
    }
}
