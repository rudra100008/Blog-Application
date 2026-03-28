package com.blogrestapi.Dao;

import com.blogrestapi.Entity.DisLike;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DisLikeDao extends MongoRepository<DisLike, Integer> {

    @Query("{ 'user.$id': ?0, 'post.$id': ?1 }")
    DisLike findByUserIdAndPostId(int userId, int postId);

    @Query(value = "{ 'user.$id': ?0, 'post.$id': ?1 }", exists = true)
    boolean existsByUserIdAndPostId(int userId, int postId);

    @Query(value = "{ 'post.$id': ?0 }", count = true)
    Long countByPostId(int postId);
}