package com.blogrestapi.Cloudinary;

import com.cloudinary.Cloudinary;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Value("${CLOUDINARY_URL}")
    private String cloudinaryUrl;

//    @Bean
//    public Cloudinary cloudinary(){
//        Dotenv dotenv = Dotenv.configure()
//                .directory(System.getProperty("user.dir"))
//                .ignoreIfMissing()
//                .load();
//
//        String cloudinaryUrl = dotenv.get("CLOUDINARY_URL");
//
//        if (cloudinaryUrl == null || cloudinaryUrl.isEmpty()) {
//            throw new IllegalStateException("CLOUDINARY_URL not found in .env file");
//        }
//        return new Cloudinary(cloudinaryUrl);
//    }

    @Bean
    public Cloudinary cloudinary(){
        if (cloudinaryUrl != null && !cloudinaryUrl.isEmpty()) {
            return new Cloudinary(cloudinaryUrl);
        }
        throw new IllegalStateException(
                "Cloudinary configuration not found. Please set CLOUDINARY_URL  as environment variables."
        );
    }
}
