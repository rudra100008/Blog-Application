package com.blogrestapi.Dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import com.blogrestapi.Entity.Category;
import com.blogrestapi.Entity.Post;
import com.blogrestapi.Entity.User;

@Repository
public interface PostDao extends MongoRepository<Post, Integer> {
    Page<Post> findPostByUser(User user, Pageable pageable);
    List<Post> findPostByUser(User user);

    // Queries the raw DBRef pointer stored in the Post document
    @Query("{ 'category.$id': ?0 }")
    Page<Post> findByCategoryId(int categoryId, Pageable pageable);

    @Query("{ 'user.$id': ?0 }")
    Page<Post> findByUserId(int userId, Pageable pageable);

    List<Post> findByPostTitleContainingIgnoreCase(String postTitle);
    Optional<Post> findByPostIdAndUser(int postId, User user);
}
