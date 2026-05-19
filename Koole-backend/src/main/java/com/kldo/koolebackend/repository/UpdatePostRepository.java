package com.kldo.koolebackend.repository;

import com.kldo.koolebackend.entity.UpdatePost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UpdatePostRepository extends JpaRepository<UpdatePost, Long> {
}
