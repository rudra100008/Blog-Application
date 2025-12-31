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
    private String image;
    private Date postDate;
    @DBRef(lazy =true)
    private User user;
    @DBRef(lazy = true)
    private Category category;
    @DBRef(lazy = true)
    private Set<Comment> comments=new HashSet<>();

   
}
