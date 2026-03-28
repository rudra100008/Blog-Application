package com.blogrestapi.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private int id;
    private String comments;
    private Integer postId;


    private  Integer  userId;


    private String username;
    private String userImageUrl;
}
