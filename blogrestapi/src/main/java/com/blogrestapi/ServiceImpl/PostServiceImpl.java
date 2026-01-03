package com.blogrestapi.ServiceImpl;

import java.io.IOException;
import java.security.PrivilegedActionException;
import java.util.Date;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import com.blogrestapi.Config.AppConstant;
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

    private static final  String  CACHE_ALL_POSTS ="cacheAllPosts";
    private static final String CACHE_POST = "cachePost";
    private static final String CACHE_POST_BY_USERID = "cachePostByUserId";
    private static  final String CACHE_POST_BY_CATEGORYID = "cachePostByCategoryId";


    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_ALL_POSTS)
    public PageResponse<PostDTO> getAllPosts(int pageNumber, int pageSize, String sortBy, String sortDir) {
        validatePaginationParams(pageNumber,pageSize);
        Pageable pageable = createPageable(pageSize,pageNumber,sortBy,sortDir);
        Page<Post> postPage = this.postDao.findAll(pageable);
        return buildPageResponse(postPage,pageNumber,pageSize);
    }


    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_POST, key = "#id")
    public PostDTO getPostById(int id) {
        return this.postDao.findById(id)
                .map(post -> modelMapper.map(post, PostDTO.class))
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with  id: " + id));
    }

    @Override
    @CacheEvict(value = {CACHE_POST,CACHE_ALL_POSTS,CACHE_POST_BY_CATEGORYID,CACHE_POST_BY_USERID},allEntries = true)
    public PostDTO createPost(PostDTO postDTO, int userId, int categoryId) {
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
    @CacheEvict(value = {CACHE_POST,CACHE_ALL_POSTS,CACHE_POST_BY_CATEGORYID,CACHE_POST_BY_USERID},allEntries = true)
            public void deletePostById(int id) {
        if (!this.postDao.existsById(id)) {
            throw new ResourceNotFoundException("Post not found with id: " + id);
        }
        PostDTO post = getPostById(id);
        if(post.getImage() != null && !post.getImage().isEmpty()){
           deletePostImage(post.getPostId());
           try{
               this.cloudFileService.deleteFile(post.getPublicId());
           }catch (IOException e){
               log.error("Failed to delete image in Cloudinary: {}", e.getMessage());
               throw new ImageInvalidException("Failed to delete image in Cloudinary");
           }
        }
        this.postDao.deleteById(id);
    }

    @Override
    @CacheEvict(value = {CACHE_POST,CACHE_ALL_POSTS,CACHE_POST_BY_CATEGORYID,CACHE_POST_BY_USERID},allEntries = true)
    public List<PostDTO> searchPost(String keyword) {
        List<Post> listPost =this.postDao.findByPostTitleContainingIgnoreCase(keyword);
        return listPost.stream().map(p->modelMapper.map(p, PostDTO.class)).toList();
    }

    @Override
    @CacheEvict(value = {CACHE_POST,CACHE_ALL_POSTS,CACHE_POST_BY_CATEGORYID,CACHE_POST_BY_USERID},allEntries = true)
    public PostDTO updatePostField(int id, PostDTO postDTO, int userId, int categoryId) {
        Post post = this.postDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        User user = this.userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found by userId: " + userId));
        Category category = this.categoryDao.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with categoryId: " + categoryId));
        if  (postDTO.getPostTitle() != null && !postDTO.getPostTitle().isEmpty()){
            post.setPostTitle(postDTO.getPostTitle());
        }  
        if (!postDTO.getContent().isEmpty()) {
            post.setContent(postDTO.getContent());
        }  
        if (postDTO.getImage()!=null && !postDTO.getImage().isEmpty()) {
           deletePostImage(postDTO.getPostId());

            post.setImage(postDTO.getImage());
        }
        if ( postDTO.getCategoryId()!=category.getCategoryId() && postDTO.getCategoryId() !=0) {
            Category newCategory = this.categoryDao.findById(postDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with categoryId: " + postDTO.getCategoryId()));
            post.setCategory(newCategory);
        } else {
            post.setCategory(category);
        }
        post.setPostDate(new Date());
         post.setUser(user);
        Post updatePost = this.postDao.save(post);
        return modelMapper.map(updatePost, PostDTO.class);
    }

    @Override
    @Cacheable(value = CACHE_POST_BY_USERID, key = "#userId")
    public PageResponse<PostDTO> getPostByUserId(int userId,int pageNumber,int pageSize,String sortBy,String sortDir) {
        User user =validateUser(userId);


        Pageable pageable= createPageable(pageSize,pageNumber,sortBy,sortDir);

        Page<Post> pagePost = this.postDao.findPostByUser(user,pageable);

        return buildPageResponse(pagePost,pageNumber,pageSize);
    }

    @Override
    @Cacheable(value = CACHE_POST_BY_CATEGORYID,key = "#categoryId")
    public PageResponse<PostDTO> getPostByCategoryId(int categoryId,int pageNumber,int pageSize,String sortBy,String sortDir) {
        validatePaginationParams(pageNumber,pageSize);
        Pageable pageable = createPageable(pageSize,pageNumber,sortBy,sortDir);
        //to get the category with provide categoryID
        this.categoryDao.findById(categoryId)
        .orElseThrow(()->new ResourceNotFoundException("Category not found by this id: "+categoryId));

        Page<Post> pagePost=this.postDao.findPostByCategoryId(categoryId,pageable);
        log.info("Posts found for categoryId {}: {}", categoryId, pagePost.getTotalElements());
        return buildPageResponse(pagePost,pageNumber,pageSize);

    }

    @Override
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
    public PostDTO getPostImageInCloud(Integer postId, Integer userId) throws  IOException{
        User user = validateUser(userId);
        Post post = getPostByIdAndUser(postId,user);

        return null;
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
