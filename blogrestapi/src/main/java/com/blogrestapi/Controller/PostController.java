package com.blogrestapi.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.blogrestapi.Config.AppConstant;
import com.blogrestapi.DTO.PageResponse;
import com.blogrestapi.DTO.PostDTO;
import com.blogrestapi.Service.PostService;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @GetMapping("/posts")
    public ResponseEntity<?> getAllPost(
            @RequestParam(value = "pageNumber", required = false, defaultValue = AppConstant.PAGE_NUMBER) int pageNumber,
            @RequestParam(value = "pageSize", required = false, defaultValue = AppConstant.PAGE_SIZE) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstant.SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstant.SORT_DIR, required = false) String sortDir) {

        PageResponse<PostDTO> getPageResponse = this.postService.getAllPosts(pageNumber, pageSize, sortBy, sortDir);

        return ResponseEntity.status(HttpStatus.OK).body(getPageResponse);
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getPostById(@PathVariable("id") int id) {
        PostDTO postDTO = this.postService.getPostById(id);


        return ResponseEntity.ok(postDTO);
    }

    @PostMapping(path = "/posts", consumes = "multipart/form-data")
    public ResponseEntity<?> createPost(
            @Valid @RequestPart("postDTO") PostDTO postDTO,
            BindingResult result,
            @RequestParam("userId") Integer userId,
            @RequestParam(value = "categoryId", required = false, defaultValue = "4") Integer categoryId,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        if (result.hasErrors()) {
            Map<String, Object> error = new HashMap<>();
            result.getFieldErrors().forEach(err -> error.put(err.getField(), err.getDefaultMessage()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "BAD_REQUEST(400)",
                    "message", error
            ));
        }

        try {

            PostDTO savedPost = this.postService.createPost(postDTO, userId, categoryId);
            if (imageFile != null && !imageFile.isEmpty()) {
                savedPost = this.postService.uploadPostImageInCloud(imageFile, savedPost.getPostId(), userId);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "INTERNAL_SERVER_ERROR(500)",
                    "message", "Failed to create post: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable("id") int id) {
        this.postService.deletePostById(id);
        return ResponseEntity.ok("Post Deleted Successfully");
    }

    @PostMapping("/posts/{postId}/uploadImageCloud/user/{userId}")
    public ResponseEntity<?> uploadPostImageToCloud(
            @RequestParam("image") MultipartFile imageFile,
            @PathVariable("postId") int postId,
            @PathVariable("userId") int userId) {

        try {
            PostDTO postDTO = this.postService.uploadPostImageInCloud(imageFile, postId, userId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Image uploaded to Cloudinary",
                    "post", postDTO,
                    "imageUrl", postDTO.getImageUrl(),  // Direct Cloudinary URL
                    "publicId", postDTO.getPublicId()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to upload image: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/posts/{postId}/cloudImage/details")
    public ResponseEntity<?> getCloudImageDetails(@PathVariable("postId") int postId) {
        try {
            PostDTO postDTO = this.postService.getPostById(postId);

            if (postDTO.getImageUrl() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "No Cloudinary image found"
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "original", postDTO.getImageUrl(),
                    "publicId", postDTO.getPublicId()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to get image details"
            ));
        }
    }

    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<?> fetchUserPosts(
            @PathVariable("userId")Integer userId,
            @RequestParam(value = "pageNumber", required = false, defaultValue = AppConstant.PAGE_NUMBER) int pageNumber,
            @RequestParam(value = "pageSize", required = false, defaultValue = AppConstant.PAGE_SIZE) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstant.SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstant.SORT_DIR, required = false) String sortDir
    ){
        PageResponse<PostDTO> postDTOS = this.postService.getPostByUserId(userId,pageNumber,pageSize,sortBy,sortDir);
        log.info("User Posts: {}",postDTOS.getData());
        return ResponseEntity.status(HttpStatus.OK).body(postDTOS);
    }
    @GetMapping("/posts/category/{categoryId}")
    public ResponseEntity<?> getPostByCategory(@PathVariable("categoryId") int categoryId,
                                               @RequestParam(value = "pageNumber", required = false, defaultValue = AppConstant.PAGE_NUMBER) int pageNumber,
                                               @RequestParam(value = "pageSize", required = false, defaultValue = AppConstant.PAGE_SIZE) int pageSize,
                                               @RequestParam(value = "sortBy", defaultValue = AppConstant.SORT_BY, required = false) String sortBy,
                                               @RequestParam(value = "sortDir", defaultValue = AppConstant.SORT_DIR, required = false) String sortDir) {

        PageResponse<PostDTO> post = this.postService.getPostByCategoryId(categoryId, pageNumber, pageSize, sortBy,
                sortDir);
        log.info("Post {}",post);
        return ResponseEntity.status(HttpStatus.OK).body(post);
    }

    // helper method

}