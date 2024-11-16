package com.blogrestapi.Controller;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
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
public class PostController {
    @Autowired
    private PostService postService;
    @Autowired
    private FileService fileService;
    @Autowired
    private ObjectMapper objectMapper;
    @Value("${project.image}")
    private String path;
    // getting the all post in the database
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPost(
            @RequestParam(value = "pageNumber", required = false, defaultValue = AppConstant.PAGE_NUMBER) int pageNumber,
            @RequestParam(value = "pageSize", required = false, defaultValue = AppConstant.PAGE_SIZE) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstant.SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstant.SORT_DIR, required = false) String sortDir) {
        PageResponse<PostDTO> getPageResponse = this.postService.getAllPost(pageNumber, pageSize, sortBy, sortDir).join();
        return ResponseEntity.status(HttpStatus.OK).body(getPageResponse);
    }

    // handler for getting single by id of the particular user
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getPostById(@PathVariable("id") int id) {
        PostDTO postDTO = this.postService.getPostById(id).join();
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

        String imageName = null;
        if(imageFile != null && !imageFile.isEmpty()) {
            try {
                // Validate file size and type
                if (imageFile.isEmpty()) {
                    response.put("status", "BAD_REQUEST(400)");
                    response.put("message", "Image file is required");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
                if (imageFile.getSize() > 10 * 1024 * 1024) { // 10MB in bytes
                    response.put("status", "BAD_REQUEST(400)");
                    response.put("message", "Image file size exceeds the maximum limit of 10MB");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
                imageName = this.fileService.uploadFile(path, imageFile);
            } catch (IOException e) {
                System.out.println(e.getMessage()); // Log the exception
                response.put("status", "INTERNAL_SERVER_ERROR(500)");
                response.put("message", "Image upload failed: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            } catch (Exception e) {
                System.out.println(e.getMessage());  // Log unexpected exceptions
                response.put("status", "INTERNAL_SERVER_ERROR(500)");
                response.put("message", "An unexpected error occurred: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        }
        if(imageFile == null){
            imageName = "";
        }
        postDTO.setImage(imageName);
        // Create the post
        PostDTO savedPost = this.postService.createPost(postDTO, userId, categoryId);
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
        String image = null;
        if(imageFile != null && !imageFile.isEmpty()){
            try {
                image = this.fileService.uploadFile(path, imageFile);
            } catch (IOException e) {
                response.put("status", "INTERNAL_SERVER_ERROR(500)");
                response.put("message", "Image upload failed: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            } catch (Exception e) {
                response.put("status", "INTERNAL_SERVER_ERROR(500)");
                response.put("message", "An unexpected error occurred: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        }
        if(imageFile ==  null || imageFile.isEmpty()){
            image = "";
        }
        postDTO.setImage(image);
        PostDTO updatePost = this.postService.updatePostField(id, postDTO, userId, categoryId);
        return ResponseEntity.ok(updatePost);
    }

    // handler for deleting the posts
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable("id") int id) {
        Map<String, Object> response = new HashMap<>();
        PostDTO getPost = this.postService.getPostById(id).join();
        this.postService.deletePostById(id);
        response.put("status", "Ok(200)");
        response.put("message", getPost);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(response);
    }
    // get post of a particular user by using id
    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<?> getPostByUser(@PathVariable("userId") int userId,
            @RequestParam(value = "pageNumber", required = false, defaultValue = AppConstant.PAGE_NUMBER) int pageNumber,
            @RequestParam(value = "pageSize", required = false, defaultValue = AppConstant.PAGE_SIZE) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = AppConstant.SORT_BY, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstant.SORT_DIR, required = false) String sortDir) {

        PageResponse<PostDTO> post = this.postService.getPostByUserId(userId, pageNumber, pageSize, sortBy, sortDir);
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

        return ResponseEntity.status(HttpStatus.OK).body(post);
    }

    // handler for searching the data by postTitle
    @GetMapping("/posts/search/{search}")
    public ResponseEntity<?> searchPostByTitle(@PathVariable("search") String search) {
        List<PostDTO> searchedPost = this.postService.searchPost(search);
        return ResponseEntity.ok(searchedPost);
    }
    //handler to save image of post
    @PostMapping("/posts/{postId}/uploadImage")
    public ResponseEntity<?> uploadPostImage(
            @RequestParam("image") MultipartFile imageFile,
            @PathVariable int postId
    ) {
        try {
            // Get the post by ID
            PostDTO postDTO = this.postService.getPostById(postId).join();
            // Upload the image file to the specified directory
            String fileName = this.fileService.uploadFile(path, imageFile);    
            // Set the image file name in the postDTO
            postDTO.setImage(fileName);
            
            // Update the post with the image
            PostDTO updatedPost = this.postService.updatePostField(postId, postDTO, postDTO.getUserId(), postDTO.getCategoryId());
            
            // Return the updated post with the image
            return ResponseEntity.status(HttpStatus.OK).body(updatedPost);
    
        } catch (IOException e) {
            // If an IOException occurs, it will be caught here
            throw new RuntimeException("File upload failed. Please try again.", e);
        }
    }
    //handler to get the image form the database
    @GetMapping(value = "/posts/image/{imageName}",produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> getImages(@PathVariable("imageName")String imageName)
    {
       try {
         InputStream is= this.fileService.getFile(path, imageName);
         byte[] b=is.readAllBytes();
        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.IMAGE_JPEG).body(b);
       } catch (FileNotFoundException e) {
        throw new RuntimeException("You have inserted wrong imageName.We could not found image with this name: "+imageName);
       }catch (IOException e) {
            throw new RuntimeException("File download  failed. Please try again.", e);
        }
    }

    

}
