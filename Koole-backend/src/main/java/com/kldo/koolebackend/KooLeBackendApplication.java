package com.kldo.koolebackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class KooLeBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(KooLeBackendApplication.class, args);
    }

}
