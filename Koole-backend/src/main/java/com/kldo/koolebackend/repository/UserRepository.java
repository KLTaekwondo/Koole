package com.kldo.koolebackend.repository;

import com.kldo.koolebackend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username = :account OR u.email = :account OR u.phone = :account")
    Optional<User> findByUsernameOrEmailOrPhone(@Param("account") String account);
}
