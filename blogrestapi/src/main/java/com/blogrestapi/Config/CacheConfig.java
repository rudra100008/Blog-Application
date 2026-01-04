package com.blogrestapi.Config;

import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {

    // Define cache names as constants for type safety
    public static final String CACHE_POSTS = "posts";
    public static final String CACHE_POST_BY_ID = "postById";
    public static final String CACHE_POSTS_BY_USER = "postsByUser";
    public static final String CACHE_POSTS_BY_CATEGORY = "postsByCategory";
    public static final String CACHE_POST_SEARCH = "postSearch";
    public static final String CACHE_USERS = "users";
    public static final String CACHE_USER_BY_ID = "userById";
    public static final String CACHE_USER_BY_USERNAME = "userByUsername";
    public static final String CACHE_CATEGORIES = "categories";
    public static final String CACHE_CATEGORY_BY_ID = "categoryById";
    public static final String CACHE_COMMENTS = "comments";
    public static final String CACHE_COMMENTS_BY_POST = "commentsByPost";

    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();

        log.info("Initializing cache manager with custom configurations");

        // Set default configuration for any dynamically created caches
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(100)
                .recordStats());

        // Register custom named caches with specific configurations
        cacheManager.registerCustomCache(CACHE_POSTS, Caffeine.newBuilder()
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .maximumSize(1000)
                .recordStats()
                .build());

        cacheManager.registerCustomCache(CACHE_POST_BY_ID, Caffeine.newBuilder()
                .expireAfterWrite(60, TimeUnit.MINUTES)
                .maximumSize(500)
                .recordStats()
                .build());

        cacheManager.registerCustomCache(CACHE_POSTS_BY_USER, Caffeine.newBuilder()
                .expireAfterWrite(15, TimeUnit.MINUTES)
                .maximumSize(200)
                .recordStats()
                .build());

        cacheManager.registerCustomCache(CACHE_POSTS_BY_CATEGORY, Caffeine.newBuilder()
                .expireAfterWrite(15, TimeUnit.MINUTES)
                .maximumSize(200)
                .recordStats()
                .build());

        cacheManager.registerCustomCache(CACHE_POST_SEARCH, Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(100)
                .recordStats()
                .build());

        cacheManager.registerCustomCache(CACHE_USERS, Caffeine.newBuilder()
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .maximumSize(300)
                .recordStats()
                .build());

        cacheManager.registerCustomCache(CACHE_USER_BY_ID, Caffeine.newBuilder()
                .expireAfterWrite(60, TimeUnit.MINUTES)
                .maximumSize(500)
                .recordStats()
                .build());

        cacheManager.registerCustomCache(CACHE_USER_BY_USERNAME, Caffeine.newBuilder()
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .maximumSize(300)
                .recordStats()
                .build());

        cacheManager.registerCustomCache(CACHE_CATEGORIES, Caffeine.newBuilder()
                .expireAfterWrite(60, TimeUnit.MINUTES)
                .maximumSize(50)
                .recordStats()
                .build());

        cacheManager.registerCustomCache(CACHE_CATEGORY_BY_ID, Caffeine.newBuilder()
                .expireAfterWrite(120, TimeUnit.MINUTES)
                .maximumSize(100)
                .recordStats()
                .build());

        cacheManager.registerCustomCache(CACHE_COMMENTS, Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(500)
                .recordStats()
                .build());

        cacheManager.registerCustomCache(CACHE_COMMENTS_BY_POST, Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(100)
                .recordStats()
                .build());

        return cacheManager;
    }
}