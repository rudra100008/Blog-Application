package com.blogrestapi.Entity;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import lombok.Builder;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "posts")
@Builder
public class Post {
    @MongoId
    private int postId;
    
    private String postTitle;
    private String content;
    private String image; // to store local Dir
    private String imageUrl; // to store url of cloud
    private String publicId;
    private Date postDate;
    @DBRef
    private User user;
    @DBRef
    private Category category;
    @DBRef
    private Set<Comment> comments=new HashSet<>();

   
}
