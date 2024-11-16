package com.blogrestapi;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;


@SpringBootApplication
@EnableAsync
@EnableCaching
@ComponentScan
public class BlogrestapiApplication  {
    public static void main(String[] args) {
        SpringApplication.run(BlogrestapiApplication.class, args);
    }

}
