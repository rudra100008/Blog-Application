package com.blogrestapi.ServiceImpl;

import java.io.IOException;
import java.util.Date;
import java.util.List;
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
    private final AuthUtils authUtils;
    private final CloudFileService cloudFileService;

    @Value("${project.post.image}")
    private String postImagePath;

    // ─────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_POSTS, key = "{#pageNumber, #pageSize, #sortBy, #sortDir}")
    public PageResponse<PostDTO> getAllPosts(int pageNumber, int pageSize, String sortBy, String sortDir) {
        log.debug("Fetching all posts - page: {}, size: {}, sort: {} {}", pageNumber, pageSize, sortBy, sortDir);
        validatePaginationParams(pageNumber, pageSize);
        Pageable pageable = createPageable(pageSize, pageNumber, sortBy, sortDir);
        Page<Post> postPage = this.postDao.findAll(pageable);
        return buildPageResponse(postPage, pageNumber, pageSize);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_POST_BY_ID, key = "#id", unless = "#result == null")
    public PostDTO getPostById(int id) {
        log.debug("Fetching post with ID: {}", id);
        Post post = this.postDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        return enrichPostDTO(modelMapper.map(post, PostDTO.class), post);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_POSTS_BY_USER,
            key = "{#userId, #pageNumber, #pageSize, #sortBy, #sortDir}")
    public PageResponse<PostDTO> getPostByUserId(int userId, int pageNumber, int pageSize, String sortBy, String sortDir) {
        log.debug("Fetching posts for user: {}, page: {}", userId, pageNumber);
        User user = this.userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Pageable pageable = createPageable(pageSize, pageNumber, sortBy, sortDir);
        Page<Post> pagePost = this.postDao.findByUserId(user.getId(), pageable);
        return buildPageResponse(pagePost, pageNumber, pageSize);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_POSTS_BY_CATEGORY,
            key = "{#categoryId, #pageNumber, #pageSize, #sortBy, #sortDir}")
    public PageResponse<PostDTO> getPostByCategoryId(int categoryId, int pageNumber, int pageSize, String sortBy, String sortDir) {
        log.debug("Fetching posts for category: {}, page: {}", categoryId, pageNumber);
        validatePaginationParams(pageNumber, pageSize);
        this.categoryDao.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found by id: " + categoryId));
        Pageable pageable = createPageable(pageSize, pageNumber, sortBy, sortDir);
        Page<Post> pagePost = this.postDao.findByCategoryId(categoryId, pageable);
        log.info("Posts found for categoryId {}: {}", categoryId, pagePost.getTotalElements());
        return buildPageResponse(pagePost, pageNumber, pageSize);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_POST_SEARCH, key = "#keyword", unless = "#result.isEmpty()")
    public List<PostDTO> searchPost(String keyword) {
        log.debug("Searching posts with keyword: {}", keyword);
        List<Post> listPost = this.postDao.findByPostTitleContainingIgnoreCase(keyword);
        return listPost.stream()
                .map(post -> enrichPostDTO(modelMapper.map(post, PostDTO.class), post))
                .toList();
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_POST_BY_ID, key = "#postId")
    public PostDTO getPostImageInCloud(Integer postId, Integer userId) throws IOException {
        User user = validateUser(userId);
        Post post = getPostByIdAndUser(postId, user);
        return enrichPostDTO(modelMapper.map(post, PostDTO.class), post);
    }

    // ─────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_POSTS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_USER, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_CATEGORY, key = "#categoryId"),
            @CacheEvict(value = CacheConfig.CACHE_POST_SEARCH, allEntries = true)
    })
    public PostDTO createPost(PostDTO postDTO, int userId, int categoryId) {
        log.info("Creating post for user: {}, category: {}", userId, categoryId);
        postDTO.setPostId((int) sequence.generateSequence("post_sequence"));

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

        // Enrich the returned DTO with user/category data so the frontend
        // gets username + userImageUrl immediately after creating a post
        PostDTO result = modelMapper.map(savedPost, PostDTO.class);
        return enrichPostDTO(result, savedPost);
    }

    // ─────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_POST_BY_ID, key = "#id"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POST_SEARCH, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_USER, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_CATEGORY,
                    condition = "#postDTO.getCategoryId() != 0 && #postDTO.getCategoryId() != T(java.lang.Integer).valueOf(#categoryId)",
                    allEntries = true)
    })
    public PostDTO updatePostField(int id, PostDTO postDTO, int userId, int categoryId) {
        log.info("Updating post ID: {}", id);
        Post post = this.postDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        if (!post.getUser().getId().equals(userId)) {
            throw new SecurityException("User not authorized to update this post");
        }
        if (postDTO.getCategoryId() != 0 && postDTO.getCategoryId() != post.getCategory().getCategoryId()) {
            Category newCategory = this.categoryDao.findById(postDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            post.setCategory(newCategory);
        }
        if (postDTO.getPostTitle() != null && !postDTO.getPostTitle().isEmpty()) {
            post.setPostTitle(postDTO.getPostTitle());
        }
        if (postDTO.getContent() != null && !postDTO.getContent().isEmpty()) {
            post.setContent(postDTO.getContent());
        }
        post.setPostDate(new Date());

        Post updatedPost = this.postDao.save(post);
        return enrichPostDTO(modelMapper.map(updatedPost, PostDTO.class), updatedPost);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_POST_BY_ID, key = "#id"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POST_SEARCH, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_USER, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_CATEGORY, allEntries = true)
    })
    public void deletePostById(int id) {
        log.info("Deleting post ID: {}", id);
        Post post = this.postDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        // Only attempt Cloudinary deletion when a publicId actually exists
        if (post.getPublicId() != null && !post.getPublicId().isEmpty()) {
            try {
                this.cloudFileService.deleteFile(post.getPublicId());
            } catch (IOException e) {
                log.error("Failed to delete Cloudinary image (publicId={}): {}", post.getPublicId(), e.getMessage());
                throw new ImageInvalidException("Failed to delete image in Cloudinary");
            }
        }
        this.postDao.delete(post);
    }

    // ─────────────────────────────────────────────────────────────
    // IMAGE UPLOAD
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_POST_BY_ID, key = "#postId"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_USER, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_CATEGORY, allEntries = true)
    })
    public PostDTO uploadPostImage(MultipartFile imageFile, Integer postId, Integer userId) {
        User user = validateUser(userId);
        if (imageFile == null || imageFile.isEmpty()) {
            throw new ResourceNotFoundException("Post image is empty or null.");
        }
        Post post = getPostByIdAndUser(postId, user);
        try {
            if (post.getImage() != null && !post.getImage().isEmpty()) {
                deleteLocalPostImage(post.getPostId());
            }
            String completePath = this.fileService.uploadFile(postImagePath, imageFile);
            post.setImage(completePath);
        } catch (IOException e) {
            throw new ImageInvalidException("Post image uploading failed.");
        }
        Post updatedPost = this.postDao.save(post);
        return enrichPostDTO(modelMapper.map(updatedPost, PostDTO.class), updatedPost);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_POST_BY_ID, key = "#postId"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS, allEntries = true),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_USER, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_POSTS_BY_CATEGORY, allEntries = true)
    })
    public PostDTO uploadPostImageInCloud(MultipartFile imageFile, Integer postId, Integer userId) throws IOException {
        User user = validateUser(userId);
        if (imageFile == null || imageFile.isEmpty()) {
            throw new ResourceNotFoundException("Post image is empty or null.");
        }
        Post post = getPostByIdAndUser(postId, user);
        try {
            if (post.getPublicId() != null && !post.getPublicId().isEmpty()) {
                cloudFileService.deleteFile(post.getPublicId());
            }
            CloudinaryResponse cloudinaryResponse = this.cloudFileService.uploadFileWithDetails(imageFile);
            post.setPublicId(cloudinaryResponse.getPublicId());
            post.setImageUrl(cloudinaryResponse.getSecureUrl());
        } catch (IOException e) {
            throw new ImageInvalidException("Post image uploading failed.");
        }
        Post updatedPost = this.postDao.save(post);
        return enrichPostDTO(modelMapper.map(updatedPost, PostDTO.class), updatedPost);
    }

    // ─────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────

    private PostDTO enrichPostDTO(PostDTO dto, Post post) {
        if (post.getUser() != null) {
            dto.setUserId(post.getUser().getId());
            dto.setUsername(post.getUser().getUsername());
            dto.setUserImageUrl(post.getUser().getImageUrl());
        }
        if (post.getCategory() != null) {
            dto.setCategoryId(post.getCategory().getCategoryId());
        }
        return dto;
    }

    private User validateUser(int userId) {
        User loggedInUser = this.authUtils.getLoggedInUser();
        if (!loggedInUser.getId().equals(userId)) {
            throw new SecurityException("User doesn't have permission for this service");
        }
        return loggedInUser;
    }

    private Post getPostByIdAndUser(Integer postId, User user) {
        return this.postDao.findByPostIdAndUser(postId, user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Post not found for user: " + user.getUsername()));
    }

    private void validatePaginationParams(int pageNumber, int pageSize) {
        if (pageNumber < 0) {
            throw new IllegalArgumentException("Page number cannot be negative");
        }
        if (pageSize < 1) {
            throw new IllegalArgumentException("Page size cannot be less than 1");
        }
    }

    private Pageable createPageable(int pageSize, int pageNumber, String sortBy, String sortDir) {
        Sort sort = "ascending".equalsIgnoreCase(sortDir)
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        return PageRequest.of(pageNumber, pageSize, sort);
    }

    private PageResponse<PostDTO> buildPageResponse(Page<Post> pagePost, int pageNumber, int pageSize) {
        List<PostDTO> postDTOS = pagePost.getContent().stream()
                .map(post -> enrichPostDTO(modelMapper.map(post, PostDTO.class), post))
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

    private void deleteLocalPostImage(Integer postId) {
        Post post = this.postDao.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found for deleting image"));
        if (post.getImage() != null && !post.getImage().isEmpty()) {
            try {
                this.fileService.deleteFile(post.getImage());
            } catch (IOException e) {
                throw new ImageInvalidException("Image failed to delete: " + e.getMessage());
            }
        }
    }
}