package com.kldo.koolebackend.repository;

import com.kldo.koolebackend.entity.Article;
import com.kldo.koolebackend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    @Query("SELECT a FROM Article a JOIN a.tags t WHERE t.id = :tagId")
    List<Article> findByTagId(@Param("tagId") Long tagId);
}
