package com.blogrestapi.ServiceImpl;

import com.blogrestapi.DTO.LikeDTO;
import com.blogrestapi.Dao.DisLikeDao;
import com.blogrestapi.Dao.LikeDao;
import com.blogrestapi.Dao.PostDao;
import com.blogrestapi.Dao.UserDao;
import com.blogrestapi.Entity.DisLike;
import com.blogrestapi.Entity.Like;
import com.blogrestapi.Entity.Post;
import com.blogrestapi.Entity.User;
import com.blogrestapi.Exception.ResourceNotFoundException;
import com.blogrestapi.Service.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LikeServiceImpl implements LikeService {

    private final LikeDao likeDao;
    private final DisLikeDao disLikeDao;
    private final ModelMapper modelMapper;
    private final UserDao userDao;
    private final PostDao postDao;
    private final SequenceGeneratorService generatorService;


    @Override
    @Transactional
    public LikeDTO postLike(int userId, int postId) {
        User user = this.userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Post post = this.postDao.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        // Check existing like in one query
        Like existingLike = this.likeDao.findByUserIdAndPostId(userId, postId);
        if (existingLike != null) {
            // Already liked — toggle it off
            this.likeDao.delete(existingLike);
            log.info("Like removed for user: {}, post: {}", userId, postId);
            return null; // frontend interprets null response.data as "un-liked"
        }

        // Remove dislike if it exists (mutually exclusive)
        DisLike existingDislike = this.disLikeDao.findByUserIdAndPostId(userId, postId);
        if (existingDislike != null) {
            this.disLikeDao.delete(existingDislike);
            log.info("Dislike removed (switching to like) for user: {}, post: {}", userId, postId);
        }

        // Add new like
        Like newLike = new Like();
        newLike.setId((int) this.generatorService.generateSequence("like_sequence"));
        newLike.setUser(user);
        newLike.setPost(post);
        Like savedLike = this.likeDao.save(newLike);
        log.info("Like added for user: {}, post: {}", userId, postId);
        return modelMapper.map(savedLike, LikeDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countLikeForPost(int postId) {
        Post post = this.postDao.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found by id: " + postId));
        return this.likeDao.countByPostId(postId);
    }

    @Override
    @Transactional
    public void removeLike(int userId, int postId) {
        Like like = this.likeDao.findByUserIdAndPostId(userId, postId);
        if (like != null) {
            this.likeDao.delete(like);
        }
    }
}