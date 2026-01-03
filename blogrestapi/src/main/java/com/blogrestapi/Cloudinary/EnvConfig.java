package com.blogrestapi.Cloudinary;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnvConfig {
    @PostConstruct
    public void init(){
        Dotenv dotenv = Dotenv.configure()
                .directory(System.getProperty("user.dir"))
                .ignoreIfMissing()
                .load();
        
        dotenv.entries()
                .forEach(dotenvEntry ->
                        System.setProperty(dotenvEntry.getKey(),dotenvEntry
                                .getValue()));
    }
}
