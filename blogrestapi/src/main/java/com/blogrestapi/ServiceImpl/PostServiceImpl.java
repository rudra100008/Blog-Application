package com.blogrestapi.ServiceImpl;

import java.io.IOException;
import java.security.PrivilegedActionException;
import java.util.Date;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import com.blogrestapi.Config.AppConstant;
import com.blogrestapi.Config.CacheConfig;
import com.blogrestapi.DTO.CloudinaryResponse;
import com.blogrestapi.Exception.ImageInvalidException;
import com.blogrestapi.Security.AuthUtils;
import com.blogrestapi.Service.CloudFileService;
import com.blogrestapi.Service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.blogrestapi.DTO.PageResponse;
import com.blogrestapi.DTO.PostDTO;
import com.blogrestapi.Dao.CategoryDao;
import com.blogrestapi.Dao.PostDao;
import com.blogrestapi.Dao.UserDao;
import com.blogrestapi.Entity.Category;
import com.blogrestapi.Entity.Post;
import com.blogrestapi.Entity.User;
import com.blogrestapi.Exception.ResourceNotFoundException;
import com.blogrestapi.Service.PostService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PostServiceImpl implements PostService {
    private final PostDao postDao;
    private final ModelMapper modelMapper;
    private final UserDao userDao;
    private final CategoryDao categoryDao;
    private final SequenceGeneratorService sequence;
    private final FileService fileService;
    @Value("${project.post.image}")
    private String postImagePath;
    private final AuthUtils authUtils;
    private final CloudFileService cloudFileService;



    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_POSTS,
            key = "{#pageNumber, #pageSize, #sortBy, #sortDir}")
    public PageResponse<PostDTO> getAllPosts(int pageNumber, int pageSize, String sortBy, String sortDir) {
        log.debug("Fetching all posts from database - page: {}, size: {}", pageNumber, pageSize);
        validatePaginationParams(pageNumber,pageSize);
        Pageable pageable = createPageable(pageSize,pageNumber,sortBy,sortDir);
        Page<Post> postPage = this.postDao.findAll(pageable);
        return buildPageResponse(postPage,pageNumber,pageSize);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_POST_BY_ID, key = "#id", unless = "#result == null")
    public PostDTO getPostById(int id) {
        log.debug("Fetching post from database with ID: {}", id);
        return this.postDao.findById(id)
                .map(post -> modelMapper.map(post, PostDTO.class))
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_POSTS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_USER, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_CATEGORY, key = "#categoryId"),
            @CacheEvict(value = CacheConfig.CACHE_POST_SEARCH, allEntries = true)
    })
    public PostDTO createPost(PostDTO postDTO, int userId, int categoryId) {
        log.info("Creating new post for user: {}, category: {}", userId, categoryId);
        postDTO.setPostId((int)sequence.generateSequence("post_sequence"));
        User user = this.userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found by userId: " + userId));
        Category category = this.categoryDao.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Post post = modelMapper.map(postDTO, Post.class);
        post.setImage(postDTO.getImage() != null ? postDTO.getImage() : "default.jpg");
        post.setPostDate(new Date());
        post.setUser(user);
        post.setCategory(category);
        Post savedPost = this.postDao.save(post);
        return modelMapper.map(savedPost, PostDTO.class);
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_POST_BY_ID, key = "#id"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POST_SEARCH, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_USER, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_CATEGORY, allEntries = true)
    })
    public void deletePostById(int id) {
        log.info("Deleting post with ID: {}", id);
        Post post = this.postDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        if(post.getImage() != null && !post.getImage().isEmpty()){
            try{
                this.cloudFileService.deleteFile(post.getPublicId());
            }catch (IOException e){
                log.error("Failed to delete image in Cloudinary: {}", e.getMessage());
                throw new ImageInvalidException("Failed to delete image in Cloudinary");
            }
        }
        this.postDao.delete(post);
    }

    @Override
    @Transactional
    @Cacheable(value = CacheConfig.CACHE_POST_SEARCH, key = "#keyword", unless = "#result.isEmpty()")
    public List<PostDTO> searchPost(String keyword) {
        log.debug("Searching posts with keyword: {}", keyword);
        List<Post> listPost = this.postDao.findByPostTitleContainingIgnoreCase(keyword);
        return listPost.stream().map(p -> modelMapper.map(p, PostDTO.class)).toList();
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_POST_BY_ID, key = "#id"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POST_SEARCH, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_USER, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_CATEGORY,
                    condition = "#postDTO.getCategoryId() != 0 && #postDTO.getCategoryId() != T(java.lang.Integer).valueOf(#categoryId)",
                    allEntries = true)
    })
    public PostDTO updatePostField(int id, PostDTO postDTO, int userId, int categoryId) {
        log.info("Updating post with ID: {}", id);
        Post post = this.postDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        if (!post.getUser().getId().equals(userId)){
            throw new SecurityException("User not authorized to update this post");
        }

        if (postDTO.getCategoryId() != 0 && postDTO.getCategoryId() != post.getCategory().getCategoryId()) {
            Category newCategory = this.categoryDao.findById(postDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            post.setCategory(newCategory);
        }
        if (postDTO.getPostTitle() != null && !postDTO.getPostTitle().isEmpty()){
            post.setPostTitle(postDTO.getPostTitle());
        }
        if (!postDTO.getContent().isEmpty()) {
            post.setContent(postDTO.getContent());
        }

        post.setPostDate(new Date());
        Post updatePost = this.postDao.save(post);
        return modelMapper.map(updatePost, PostDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_POSTS_BY_USER,
            key = "{#userId, #pageNumber, #pageSize, #sortBy, #sortDir}")
    public PageResponse<PostDTO> getPostByUserId(int userId, int pageNumber, int pageSize, String sortBy, String sortDir) {
        log.debug("Fetching posts for user ID: {}, page: {}", userId, pageNumber);
        User user = this.userDao.findById(userId)
                .orElseThrow(()-> new ResourceNotFoundException("User not found"));

        Pageable pageable= createPageable(pageSize,pageNumber,sortBy,sortDir);
        Page<Post> pagePost = this.postDao.findPostByUserId(user.getId(),pageable);
        return buildPageResponse(pagePost,pageNumber,pageSize);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_POSTS_BY_CATEGORY,
            key = "{#categoryId, #pageNumber, #pageSize, #sortBy, #sortDir}")
    public PageResponse<PostDTO> getPostByCategoryId(int categoryId, int pageNumber, int pageSize, String sortBy, String sortDir) {
        log.debug("Fetching posts for category ID: {}, page: {}", categoryId, pageNumber);
        validatePaginationParams(pageNumber,pageSize);
        Pageable pageable = createPageable(pageSize,pageNumber,sortBy,sortDir);

        // Validate category exists
        this.categoryDao.findById(categoryId)
                .orElseThrow(()->new ResourceNotFoundException("Category not found by this id: "+categoryId));

        Page<Post> pagePost=this.postDao.findPostByCategoryId(categoryId,pageable);
        log.info("Posts found for categoryId {}: {}", categoryId, pagePost.getTotalElements());
        return buildPageResponse(pagePost,pageNumber,pageSize);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_POST_BY_ID, key = "#postId"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_USER, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_CATEGORY, allEntries = true)
    })
    public PostDTO uploadPostImage(MultipartFile imageFile, Integer postId,Integer userId) {
        User user = validateUser(userId);
        if ( imageFile == null || imageFile.isEmpty()){
            throw new ResourceNotFoundException("Post Image is empty or null.");
        }
        Post post = getPostByIdAndUser(postId,user);
        try{
            if(post.getImage() != null && !post.getImage().isEmpty()){
                deletePostImage(post.getPostId());
            }
            String completePath = this.fileService.uploadFile(postImagePath,imageFile);
            post.setImage(completePath);
        }catch(IOException e){
            throw new ImageInvalidException("Post image uploading failed.");
        }
        Post updatedPost = this.postDao.save(post);
        return this.modelMapper.map(updatedPost,PostDTO.class);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_POST_BY_ID, key = "#postId"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_USER, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_CATEGORY, allEntries = true)
    })
    public PostDTO uploadPostImageInCloud(MultipartFile imageFile, Integer postId, Integer userId)throws  IOException {
        User user = validateUser(userId);
        if ( imageFile == null || imageFile.isEmpty()){
            throw new ResourceNotFoundException("Post Image is empty or null.");
        }
        Post post = getPostByIdAndUser(postId,user);
        try{
            if(post.getPublicId() != null && !post.getPublicId().isEmpty()){
                cloudFileService.deleteFile(post.getPublicId());
            }
            CloudinaryResponse cloudinaryResponse = this.cloudFileService.uploadFileWithDetails(imageFile);
            post.setPublicId(cloudinaryResponse.getPublicId());
            post.setImageUrl(cloudinaryResponse.getSecureUrl());
        }catch(IOException e){
            throw new ImageInvalidException("Post image uploading failed.");
        }
        Post updatedPost = this.postDao.save(post);
        return this.modelMapper.map(updatedPost,PostDTO.class);
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_POST_BY_ID, key = "#postId")
    public PostDTO getPostImageInCloud(Integer postId, Integer userId) throws  IOException{
        User user = validateUser(userId);
        Post post = getPostByIdAndUser(postId,user);
        return modelMapper.map(post, PostDTO.class);
    }


    //helper method
    private User validateUser(int userId){
        User loggedInUser = this.authUtils.getLoggedInUser();
        if (!loggedInUser.getId().equals(userId)){
            throw new SecurityException("User doesn't have permission for this service");
        }
        return loggedInUser;
    }
    private Post getPostById(Integer postId){
        return this.postDao.findById(postId)
                .orElseThrow(()-> new ResourceNotFoundException("Post not found in server."));
    }
    private  Post getPostByIdAndUser(Integer postId,User user){
        return  this.postDao.findByPostIdAndUser(postId,user)
                .orElseThrow(()-> new ResourceNotFoundException("Post not found of user: "+ user.getUsername()));
    }
    private  void validatePaginationParams(int pageNumber,int pageSize){
        if (pageNumber < 0){
            throw new IllegalArgumentException("Page number cannot be negative");
        }

        if (pageSize < 1){
            throw new IllegalArgumentException("Page size cannot be less than 1");
        }
    }

    private Pageable createPageable(int pageSize,int pageNumber,String sortBy, String sortDir){
        Sort sort = AppConstant.SORT_DIR.equalsIgnoreCase(sortDir)
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return PageRequest.of(pageNumber,pageSize,sort);
    }

    private PageResponse<PostDTO> buildPageResponse(Page<Post> pagePost,int pageNumber,int pageSize){
        List<PostDTO> postDTOS = pagePost.getContent().stream()
                .map(post -> this.modelMapper.map(post,PostDTO.class))
                .toList();

        return new PageResponse<>(
                "OK(200)",
                postDTOS,
                pageSize,
                pageNumber,
                pagePost.getTotalPages(),
                pagePost.getTotalElements(),
                pagePost.isLast()
        );
    }

    private void deletePostImage(Integer postId){
        Post post = this.postDao.findById(postId)
                .orElseThrow(()-> new ResourceNotFoundException(
                        "Post not found for deleting image "
                ));
        if(post.getImage() != null && !post.getImage().isEmpty()){
            try{
                this.fileService.deleteFile(post.getImage());
            }catch (IOException e){
                throw new ImageInvalidException("Image failed to delete: "+ e.getMessage());
            }
        }

    }
}
