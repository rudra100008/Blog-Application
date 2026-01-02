package com.blogrestapi.Controller;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.blogrestapi.Entity.Post;
import com.blogrestapi.Exception.ImageInvalidException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.blogrestapi.Config.AppConstant;
import com.blogrestapi.DTO.PageResponse;
import com.blogrestapi.DTO.PostDTO;
import com.blogrestapi.Service.FileService;
import com.blogrestapi.Service.PostService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final FileService fileService;
    private final ObjectMapper objectMapper;



    // getting the all post in the database
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPost(
            @RequestParam(value = "pageNumber", required = false, defaultValue = AppConstant.PAGE_NUMBER) int pageNumber,
            @RequestParam(value = "pageSize", required = false, defaultValue = AppConstant.PAGE_SIZE) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstant.SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstant.SORT_DIR, required = false) String sortDir
    )
    {

        PageResponse<PostDTO> getPageResponse = this.postService.getAllPosts(pageNumber, pageSize, sortBy, sortDir);
        updatePostImageUrl(getPageResponse);
        return ResponseEntity.status(HttpStatus.OK).body(getPageResponse);
    }

    // handler for getting single by id of the particular user
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getPostById(@PathVariable("id") int id) {
        PostDTO postDTO = this.postService.getPostById(id);
        postDTO.setImage(getImageUrl(postDTO.getPostId()));
        return ResponseEntity.ok(postDTO);
    }

    // handler for the creating or saving the post in the database
    @PostMapping(path = "/posts", consumes = "multipart/form-data")
    public ResponseEntity<?> createPost(@Valid @RequestPart("postDTO") PostDTO postDTO,
                                        BindingResult result,
                                        @RequestParam("userId") Integer userId,
                                        @RequestParam(value="categoryId",required = false,defaultValue = "4") Integer categoryId,
                                        @RequestPart(value="image",required = false) MultipartFile imageFile) {
        Map<String, Object> response = new HashMap<>();

        if (result.hasErrors()) {
            Map<String, Object> error = new HashMap<>();
            result.getFieldErrors().forEach(err -> error.put(err.getField(), err.getDefaultMessage()));
            response.put("status", "BAD_REQUEST(400)");
            response.put("message", error);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Create the post
        PostDTO savedPost = this.postService.createPost(postDTO, userId, categoryId);
        if (imageFile != null && !imageFile.isEmpty()) {
            savedPost = this.postService.uploadPostImage(imageFile, savedPost.getPostId(), userId);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }




    // handler for updating the post
    @PutMapping("/posts/{id}/users/{userId}")
    public ResponseEntity<?> updatePost(@PathVariable("id") int id,
            @Valid  @RequestPart(value = "postDTO") PostDTO postDTO,
            BindingResult result,
            @PathVariable("userId") int userId,
            @RequestParam("categoryId") int categoryId,
            @RequestPart(value = "image",required = false) MultipartFile imageFile) {
        Map<String, Object> response = new HashMap<>();
        if (result.hasErrors()) {
            Map<String, Object> error = new HashMap<>();
            result.getFieldErrors().forEach(field -> error.put(field.getField(), field.getDefaultMessage()));
            response.put("status", "BAD_REQUEST(400)");
            response.put("message", error);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        PostDTO updatePost = this.postService.updatePostField(id, postDTO, userId, categoryId);
        if (imageFile != null && !imageFile.isEmpty()) {
            updatePost = this.postService.uploadPostImage(imageFile, updatePost.getPostId(), userId);
        }
        return ResponseEntity.ok(updatePost);
    }

    // handler for deleting the posts
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable("id") int id) {

        this.postService.deletePostById(id);

        return ResponseEntity.status(HttpStatus.OK).body("Post Deleted Successfully");
    }
    // get post of a particular user by using id
    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<?> getPostByUser(@PathVariable("userId") int userId,
            @RequestParam(value = "pageNumber", required = false, defaultValue = AppConstant.PAGE_NUMBER) int pageNumber,
            @RequestParam(value = "pageSize", required = false, defaultValue = AppConstant.PAGE_SIZE) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstant.SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstant.SORT_DIR, required = false) String sortDir) {

        PageResponse<PostDTO> post = this.postService.getPostByUserId(userId, pageNumber, pageSize, sortBy, sortDir);
        updatePostImageUrl(post);
        return ResponseEntity.status(HttpStatus.OK).body(post);
    }

    // get posts of in a particular category
    @GetMapping("/posts/category/{categoryId}")
    public ResponseEntity<?> getPostByCategory(@PathVariable("categoryId") int categoryId,
            @RequestParam(value = "pageNumber", required = false, defaultValue = AppConstant.PAGE_NUMBER) int pageNumber,
            @RequestParam(value = "pageSize", required = false, defaultValue = AppConstant.PAGE_SIZE) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstant.SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstant.SORT_DIR, required = false) String sortDir) {

        PageResponse<PostDTO> post = this.postService.getPostByCategoryId(categoryId, pageNumber, pageSize, sortBy,
                sortDir);
        log.info("Post {}",post);
        updatePostImageUrl(post);
        return ResponseEntity.status(HttpStatus.OK).body(post);
    }

    // handler for searching the data by postTitle
    @GetMapping("/posts/search/{search}")
    public ResponseEntity<?> searchPostByTitle(@PathVariable("search") String search) {
        List<PostDTO> searchedPost = this.postService.searchPost(search);
        searchedPost.forEach(postDTO -> postDTO.setImage(getImageUrl(postDTO.getPostId())));
        return ResponseEntity.ok(searchedPost);
    }

    //handler to save image of post
    @PostMapping("/posts/{postId}/uploadImage/user/{userId}")
    public ResponseEntity<?> uploadPostImage(
            @RequestParam("image") MultipartFile imageFile,
            @PathVariable("postId") int postId,
            @PathVariable("userId") int userId
    ) {
            PostDTO postDTO = this.postService.uploadPostImage(imageFile,postId,userId);

            return ResponseEntity.status(HttpStatus.OK).body(postDTO);
    }
    //handler to get the image form the database
    @GetMapping(value = "/posts/{postId}/fetchPostImage")
    public ResponseEntity<byte[]> getImages(@PathVariable("postId")Integer postId)
    {
        PostDTO postDTO = this.postService.getPostById(postId);
        log.info("PostDTo:{} ",postDTO);
       try {
           byte[] b = this.fileService.getFile(postDTO.getImage());
           MediaType mediaType = this.fileService.determineMediaType(postDTO.getImage());
        return ResponseEntity.status(HttpStatus.OK).contentType(mediaType).body(b);
       } catch (IOException e) {
            throw new ImageInvalidException("Image download  failed. Please try again.");
        }

    }

    private String getImageUrl(Integer postId){
        return "/posts/"+postId +"/fetchPostImage";
    }

    private void updatePostImageUrl(PageResponse<PostDTO> postDTOPageResponse){
        postDTOPageResponse.getData()
                .forEach(postDTO -> postDTO.setImage(getImageUrl(postDTO.getPostId())));
    }

    

}
