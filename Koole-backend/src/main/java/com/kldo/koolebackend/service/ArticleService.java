package com.kldo.koolebackend.service;

import com.kldo.koolebackend.entity.Article;
import com.kldo.koolebackend.repository.ArticleRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArticleService  {
    @Autowired
    private ArticleRepository articleRepository;

    public List<Article> findAll(){
        return articleRepository.findAll();
    }

    public Article findById(Long id){
        return articleRepository.findById(id).orElse(null);
    }

    public void create(Article article){
        articleRepository.save(article);
    }

    public void update(Article article){
        Article existingArticle = articleRepository.findById(article.getArticleId()).orElse(null);
        if(existingArticle != null){
            existingArticle.setTitle(article.getTitle());
            existingArticle.setContent(article.getContent());
            articleRepository.save(existingArticle);
        }
    }

    public void delete(Long id) {
        articleRepository.deleteById(id);
    }
}
