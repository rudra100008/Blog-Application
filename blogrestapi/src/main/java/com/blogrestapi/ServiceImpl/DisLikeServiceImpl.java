package com.blogrestapi.ServiceImpl;

import com.blogrestapi.DTO.DisLikeDTO;
import com.blogrestapi.Dao.DisLikeDao;
import com.blogrestapi.Dao.LikeDao;
import com.blogrestapi.Dao.PostDao;
import com.blogrestapi.Dao.UserDao;
import com.blogrestapi.Entity.DisLike;
import com.blogrestapi.Entity.Like;
import com.blogrestapi.Entity.Post;
import com.blogrestapi.Entity.User;
import com.blogrestapi.Exception.ResourceNotFoundException;
import com.blogrestapi.Service.DisLikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisLikeServiceImpl implements DisLikeService {

    private final DisLikeDao disLikeDao;
    private final LikeDao likeDao;
    private final ModelMapper modelMapper;
    private final UserDao userDao;
    private final PostDao postDao;
    private final SequenceGeneratorService generatorService;

    /**
     * Toggle dislike on a post.
     *
     * Rules:
     *  - If already disliked → remove dislike (toggle off), return null
     *  - If already liked    → remove like first, then add dislike
     *  - Otherwise           → add dislike
     *
     * FIX 1: Was using synchronized — wrong tool for distributed/concurrent safety.
     *        @Transactional is the correct approach for MongoDB operations.
     *
     * FIX 2: Was using @Autowired field injection — switched to constructor
     *        injection via @RequiredArgsConstructor (consistent with rest of codebase,
     *        and allows final fields + easier testing).
     *
     * FIX 3: Was calling existsByUserAndPost + findByUserAndPost separately — two DB
     *        round trips. Now calls findByUserIdAndPostId once and checks null.
     *
     * FIX 4: existsByUserAndPost / findByUserAndPost pass full User/Post objects
     *        across @DBRef boundaries — unreliable in MongoDB Spring Data.
     *        DAOs now use @Query("{'user.$id': ?0, 'post.$id': ?1}") instead.
     */
    @Override
    @Transactional
    public DisLikeDTO postDelete(int userId, int postId) {
        User user = this.userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found by id: " + userId));
        Post post = this.postDao.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found by id: " + postId));

        // Check existing dislike in one query
        DisLike existingDislike = this.disLikeDao.findByUserIdAndPostId(userId, postId);
        if (existingDislike != null) {
            // Already disliked — toggle it off
            this.disLikeDao.delete(existingDislike);
            log.info("Dislike removed for user: {}, post: {}", userId, postId);
            return null; // frontend interprets null response.data as "un-disliked"
        }

        // Remove like if it exists (mutually exclusive)
        Like existingLike = this.likeDao.findByUserIdAndPostId(userId, postId);
        if (existingLike != null) {
            this.likeDao.delete(existingLike);
            log.info("Like removed (switching to dislike) for user: {}, post: {}", userId, postId);
        }

        // Add new dislike
        DisLike newDislike = new DisLike(
                (int) this.generatorService.generateSequence("dislike_sequence"),
                user,
                post
        );
        DisLike savedDislike = this.disLikeDao.save(newDislike);
        log.info("Dislike added for user: {}, post: {}", userId, postId);
        return modelMapper.map(savedDislike, DisLikeDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countDislikes(int postId) {
        this.postDao.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found by id: " + postId));
        return this.disLikeDao.countByPostId(postId);
    }

    @Override
    @Transactional
    public void removeDislike(int userId, int postId) {
        DisLike disLike = this.disLikeDao.findByUserIdAndPostId(userId, postId);
        if (disLike != null) {
            this.disLikeDao.delete(disLike);
        }
    }
}