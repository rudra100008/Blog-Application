package com.blogrestapi;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.blogrestapi.Dao.RoleDao;

@SpringBootApplication
@EnableAsync
@EnableCaching
public class BlogrestapiApplication  {

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private RoleDao roleDao;

    public static void main(String[] args) {
        SpringApplication.run(BlogrestapiApplication.class, args);
    }

}
