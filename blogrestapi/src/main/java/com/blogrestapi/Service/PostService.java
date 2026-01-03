package com.blogrestapi.Service;


import java.io.IOException;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.stereotype.Service;

import com.blogrestapi.DTO.PageResponse;
import com.blogrestapi.DTO.PostDTO;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface PostService {

    //get all post
    PageResponse<PostDTO> getAllPosts(int pageNumber, int pageSize, String sortBy, String sortDir);
    //get post by id
    PostDTO getPostById(int id);
    //save the post
    PostDTO createPost(PostDTO postDTO,int userId,int categoryId);
    //delete the post
    void deletePostById(int id);
    //patch the post(to update the only required filled(like postTitle or content or image etc))
    PostDTO updatePostField(int id,PostDTO postDTO,int userId,int categoryId);
    //search post
    List<PostDTO> searchPost(String keyword);
    //to get the post by userID
    PageResponse<PostDTO> getPostByUserId(int userId,int pageNumber,int pageSize,String sortBy,String sortDir);
    //to get the post by cateforyId
    PageResponse<PostDTO> getPostByCategoryId(int categoryId,int pageNumber,int pageSize,String sortBy,String sortDir);

    PostDTO uploadPostImage(MultipartFile imageFile,Integer postId,Integer userId);

    PostDTO uploadPostImageInCloud(MultipartFile imageFile,Integer postId,Integer userId)throws IOException;

    PostDTO getPostImageInCloud(Integer postId,Integer userId)throws IOException;
}
