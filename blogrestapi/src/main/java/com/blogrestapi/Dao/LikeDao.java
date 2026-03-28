package com.blogrestapi.Dao;

import com.blogrestapi.Entity.Like;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeDao extends MongoRepository<Like, Integer> {

    @Query("{ 'user.$id': ?0, 'post.$id': ?1 }")
    Like findByUserIdAndPostId(int userId, int postId);

    @Query(value = "{ 'user.$id': ?0, 'post.$id': ?1 }", exists = true)
    boolean existsByUserIdAndPostId(int userId, int postId);

    // Count by post.$id — avoids loading the full Post object just to count
    @Query(value = "{ 'post.$id': ?0 }", count = true)
    Long countByPostId(int postId);
}