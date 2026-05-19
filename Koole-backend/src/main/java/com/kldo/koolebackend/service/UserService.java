package com.kldo.koolebackend.service;

import com.kldo.koolebackend.entity.User;
import com.kldo.koolebackend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService{
    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public User findById(Long id){
        return userRepository.findById(id).orElse(null);
    }
    public void login(String username, String password){
        User user = userRepository.findByUsername(username).orElse(null);
        if(user == null){
            throw new IllegalArgumentException("Username or password is incorrect");
        }
        if(!user.getPassword().equals(password)){
            throw new IllegalArgumentException("Username or password is incorrect");
        }
    }

    @Transactional
    public void register(User user){
        userRepository.save(user);
    }

    public void logout(){
        System.out.println("Logout");
    }

    @Transactional
    public void update(Long id,User user){
        User existingUser = userRepository.findById(id).orElse(null);
        if(existingUser != null){
            existingUser.setUsername(user.getUsername());
            existingUser.setPassword(user.getPassword());
            existingUser.setEmail(user.getEmail());
            existingUser.setPhone(user.getPhone());
            userRepository.save(existingUser);
        }
    }

    @Transactional
    public void delete(Long id){
        userRepository.deleteById(id);
    }



}
