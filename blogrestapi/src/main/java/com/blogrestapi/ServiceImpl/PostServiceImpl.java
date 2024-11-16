package com.blogrestapi.ServiceImpl;

import java.util.Date;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import com.blogrestapi.Config.AppConstant;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
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

@Service
@Transactional
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {
    private PostDao postDao;
    private ModelMapper modelMapper;
    private UserDao userDao;
    private CategoryDao categoryDao;
    private SequenceGeneratorService sequence;

    private static final  String  CACHE_ALL_POSTS ="cacheAllPosts";
    private static final String CACHE_POST = "cachePost";
    private static final String CACHE_POST_BY_USERID = "cachePostByUserId";
    private static  final String CACHE_POST_BY_CATEGORYID = "cachePostByCategoryId";

    @Async
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_ALL_POSTS)
    public CompletableFuture<PageResponse<PostDTO>> getAllPost(int pageNumber, int pageSize, String sortBy, String sortDir) {

        Sort sort=sortDir.equalsIgnoreCase(AppConstant.SORT_DIR)
                ?Sort.by(sortBy).ascending()
                :Sort.by(sortBy).descending();
        Pageable pageable=PageRequest.of(pageNumber, pageSize,sort);
        Page<Post> page=this.postDao.findAll(pageable);
        List<PostDTO> allPost=page.getContent().stream().map(
                e->modelMapper.map(e, PostDTO.class)
        ).toList();
        long totalElement=page.getTotalElements();
        int totalPage=page.getTotalPages();
        boolean lastPage=page.isLast();
        PageResponse<PostDTO> pageResponse=new PageResponse<>(
                "OK(200)",
                allPost,
                pageSize,
                pageNumber,
                totalPage,
                totalElement,
                lastPage
        );
        return CompletableFuture.completedFuture(pageResponse);
    }


    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_POST, key = "#id")
    public CompletableFuture<PostDTO> getPostById(int id) {
        PostDTO fetchPostById = this.postDao.findById(id)
                .map(post -> modelMapper.map(post, PostDTO.class))
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with  id: " + id));
        return CompletableFuture.completedFuture(fetchPostById);
    }

    @Override
    @CacheEvict(value = {CACHE_POST,CACHE_ALL_POSTS,CACHE_POST_BY_CATEGORYID,CACHE_POST_BY_USERID},allEntries = true)
    public PostDTO createPost(PostDTO postDTO, int userId, int categoryId) {
        postDTO.setPostId((int)sequence.generateSequence("post_sequence"));
        User user = this.userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found by userId: " + userId));
        Category category = this.categoryDao.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with categoryId: " + categoryId));

        Post post = modelMapper.map(postDTO, Post.class);
        post.setImage(postDTO.getImage() != null ? postDTO.getImage() : "default.jpg");
        post.setPostDate(new Date());
        post.setUser(user);
        post.setCategory(category);
        Post savedPost = this.postDao.save(post);
        return modelMapper.map(savedPost, PostDTO.class);
    }


    @Async
    @Override
    @CacheEvict(value = {CACHE_POST,CACHE_ALL_POSTS,CACHE_POST_BY_CATEGORYID,CACHE_POST_BY_USERID},allEntries = true)
            public void deletePostById(int id) {
        if (!this.postDao.existsById(id)) {
            throw new ResourceNotFoundException("Post not found with id: " + id);
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
        if (!postDTO.getPostTitle().isEmpty()) {
            post.setPostTitle(postDTO.getPostTitle());
        }  
        if (!postDTO.getContent().isEmpty()) {
            post.setContent(postDTO.getContent());
        }  
        if (postDTO.getImage()!=null) {
            post.setImage(postDTO.getImage());
        } else
        {
            post.setImage("default.jpg");
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
        Sort sort=sortDir.equalsIgnoreCase(AppConstant.SORT_DIR)
        ?Sort.by(sortBy).ascending():Sort.by(sortBy).descending();
        User user =this.userDao.findById(userId)
        .orElseThrow(()->new ResourceNotFoundException("User not found by this id: "+userId));
        Pageable pageable=PageRequest.of(pageNumber, pageSize,sort);
        Page<Post> page=this.postDao.findPostByUser(user,pageable);
        List<PostDTO> allPost=page.getContent().stream().map(
            e->modelMapper.map(e, PostDTO.class)
        ).toList();
        long totalElement=page.getTotalElements();
        int totalPage=page.getTotalPages();
        boolean lastPage=page.isLast();
        return new PageResponse<>(
            "OK(200)",
            allPost,
            pageSize,
            pageNumber,
            totalPage,
            totalElement,
            lastPage
        );
    }

    @Override
    @Cacheable(value = CACHE_POST_BY_CATEGORYID,key = "#categoryId")
    public PageResponse<PostDTO> getPostByCategoryId(int categoryId,int pageNumber,int pageSize,String sortBy,String sortDir) {
        Sort sort=sortDir.equalsIgnoreCase(AppConstant.SORT_DIR)
        ?Sort.by(sortBy).ascending():Sort.by(sortBy).descending();
        //to get the category with provide categoryID
        Category category=this.categoryDao.findById(categoryId)
        .orElseThrow(()->new ResourceNotFoundException("Category not found by this id: "+categoryId));

        Pageable pageable=PageRequest.of(pageNumber, pageSize,sort);
        Page<Post> pagePost=this.postDao.findPostByCategory(category,pageable);
        List<PostDTO> allPost=pagePost.getContent().stream()
        .map(post->modelMapper.map(post, PostDTO.class)).toList();

        long totalElement=pagePost.getTotalElements();
        int totalPage=pagePost.getTotalPages();
        boolean lastPage=pagePost.isLast();
        return new PageResponse<>(
            "Ok(200)",
            allPost,
            pageSize,
            pageNumber,
            totalPage,
            totalElement,
            lastPage
        );

    }
}
