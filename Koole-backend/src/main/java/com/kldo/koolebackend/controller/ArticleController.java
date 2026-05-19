package com.kldo.koolebackend.controller;

import com.kldo.koolebackend.entity.Article;
import com.kldo.koolebackend.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/article")
@CrossOrigin("http://localhost:5173")
public class ArticleController {
    @Autowired
    private ArticleService articleService;

    @GetMapping("/findAll")
    public List<Article> findAll() {
        return articleService.findAll();
    }

    @GetMapping("/findById/{id}")
    public Article findById(@PathVariable Long id) {
        return articleService.findById(id);
    }

    @PostMapping("/create")
    public void create(@RequestBody Article article) {
        articleService.create(article);
    }

    @PutMapping("/update")
    public void update(@RequestBody Article article) {
        articleService.update(article);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        articleService.delete(id);
    }
}
