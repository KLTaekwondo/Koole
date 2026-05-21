package com.kldo.koolebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kldo.koolebackend.entity.Comment;
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
}
