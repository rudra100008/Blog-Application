package com.blogrestapi;

import com.blogrestapi.Dao.PostDao;
import com.blogrestapi.Dao.RoleDao;
import com.blogrestapi.Dao.UserDao;
import com.blogrestapi.Dao.CategoryDao;
import com.blogrestapi.Entity.Post;
import com.blogrestapi.Entity.Role;
import com.blogrestapi.Entity.User;
import com.blogrestapi.Entity.Category;
import com.blogrestapi.ServiceImpl.SequenceGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final RoleDao roleDao;
    private final PostDao postDao;
    private final UserDao userDao;
    private final CategoryDao categoryDao;
    private final PasswordEncoder passwordEncoder;
    private final SequenceGeneratorService generatorService;
    @Value("${project.post.image}")
    private String imagePath;

    @Value("${post.image.spring-boot-api}")
    private String springBootImageUrl;

    @Value("${post.image.nepal-travel}")
    private String nepalTravelImageUrl;

    @Value("${post.image.momo-recipe}")
    private String momoRecipeImageUrl;

    @Value("${post.image.mongodb-relationships}")
    private String mongodbImageUrl;

    @Value("${post.image.annapurna-trek}")
    private String annapurnaImageUrl;


    private static final String CATEGORY_SEQUENCE = "category_sequence";
    private static  final String USER_SEQUENCE = "user_sequence";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_USER = "ROLE_USER";
    private static final String POST_SEQUENCE = "post_sequence";
    private static  final String PASSWORD = "password123";

    @Override
    public void run(String... args) throws Exception {
        log.info("Application Started.......");
        createRole();
        createCategory();
        createUser();
        createPost();
    }

    private void createRole(){
        Optional<Role> findAdmin = this.roleDao.findRoleByName(ROLE_ADMIN);
        Optional<Role> findUser = this.roleDao.findRoleByName(ROLE_USER);
        List<Role> roles = new ArrayList<>();

        if (findAdmin.isEmpty()){
            roles.add(new Role((int)generatorService.generateSequence("role_sequence"),ROLE_ADMIN));
        }
        if(findUser.isEmpty()){
            roles.add(new Role((int)generatorService.generateSequence("role_sequence"),ROLE_USER));
        }
        if(!roles.isEmpty()){
            this.roleDao.saveAll(roles);
            log.info("Roles created: {} ",roles.toString());
        }else {
            log.info("Roles already exist.");
        }
    }

    private void createCategory(){
        if(categoryDao.count() == 0){
            List<Category> categories = new ArrayList<>();
            categories.add(new Category((int)generatorService.generateSequence(CATEGORY_SEQUENCE), "Technology", new ArrayList<>()));
            categories.add(new Category((int)generatorService.generateSequence(CATEGORY_SEQUENCE), "Lifestyle", new ArrayList<>()));
            categories.add(new Category((int)generatorService.generateSequence(CATEGORY_SEQUENCE), "Travel", new ArrayList<>()));
            categories.add(new Category((int)generatorService.generateSequence(CATEGORY_SEQUENCE), "Food", new ArrayList<>()));
            categories.add(new Category((int)generatorService.generateSequence(CATEGORY_SEQUENCE), "Health", new ArrayList<>()));

            categoryDao.saveAll(categories);
            log.info("Categories created: {} " , categories.size());
        } else {
            log.info("Categories already exist.");
        }
    }

    private void createUser(){
        if(userDao.count() == 0){
            List<User> users = new ArrayList<>();

            Role adminRole = roleDao.findRoleByName(ROLE_ADMIN).orElse(null);
            Role userRole = roleDao.findRoleByName(ROLE_USER).orElse(null);

            User admin = new User();
            admin.setId((int)generatorService.generateSequence(USER_SEQUENCE));
            admin.setUsername("admin");
            admin.setEmail("admin@blogapi.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setImage("default-admin.jpg");
            admin.setPhoneNumber("+977-9801234567");
            admin.setDescription("System Administrator");
            admin.setEnable(true);
            admin.setRole(adminRole);
            admin.setPost(new ArrayList<>());
            users.add(admin);

            // Create regular users
            User user1 = new User();
            user1.setId((int)generatorService.generateSequence(USER_SEQUENCE));
            user1.setUsername("john_doe");
            user1.setEmail("john.doe@example.com");
            user1.setPassword(passwordEncoder.encode(PASSWORD));
            user1.setImage("john-avatar.jpg");
            user1.setPhoneNumber("+977-9812345678");
            user1.setDescription("Tech enthusiast and blogger");
            user1.setEnable(true);
            user1.setRole(userRole);
            user1.setPost(new ArrayList<>());
            users.add(user1);

            User user2 = new User();
            user2.setId((int)generatorService.generateSequence(USER_SEQUENCE));
            user2.setUsername("jane_smith");
            user2.setEmail("jane.smith@example.com");
            user2.setPassword(passwordEncoder.encode(PASSWORD));
            user2.setImage("jane-avatar.jpg");
            user2.setPhoneNumber("+977-9823456789");
            user2.setDescription("Travel blogger and photographer");
            user2.setEnable(true);
            user2.setRole(userRole);
            user2.setPost(new ArrayList<>());
            users.add(user2);

            User user3 = new User();
            user3.setId((int)generatorService.generateSequence(USER_SEQUENCE));
            user3.setUsername("mike_wilson");
            user3.setEmail("mike.wilson@example.com");
            user3.setPassword(passwordEncoder.encode(PASSWORD));
            user3.setImage("mike-avatar.jpg");
            user3.setPhoneNumber("+977-9834567890");
            user3.setDescription("Food critic and recipe creator");
            user3.setEnable(true);
            user3.setRole(userRole);
            user3.setPost(new ArrayList<>());
            users.add(user3);

            userDao.saveAll(users);
            log.info("Users created:{} ", users.size());
        } else {
            log.info("Users already exist.");
        }
    }

    private void createPost() {
        if (postDao.count() == 0) {
            List<Post> posts = new ArrayList<>();

            User user1 = userDao.findById(2).orElse(null);
            User user2 = userDao.findById(3).orElse(null);
            User user3 = userDao.findById(4).orElse(null);

            Category techCategory = categoryDao.findById(1).orElse(null);
            Category travelCategory = categoryDao.findById(3).orElse(null);
            Category foodCategory = categoryDao.findById(4).orElse(null);

            // Post 1
            Post post1 = new Post();
            post1.setPostId((int) generatorService.generateSequence(POST_SEQUENCE));
            post1.setPostTitle("Introduction to Spring Boot REST API");
            post1.setContent("Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications. In this post, we'll explore how to build a RESTful API using Spring Boot and MongoDB.");

            // Use Cloudinary-ready URL
            post1.setImage(springBootImageUrl);
            post1.setImageUrl(springBootImageUrl);
            post1.setPublicId("spring-boot-api-demo"); // Simple public ID

            post1.setPostDate(new Date());
            post1.setUser(user1);
            post1.setCategory(techCategory);
            post1.setComments(new java.util.HashSet<>());
            posts.add(post1);

            // Post 2
            Post post2 = new Post();
            post2.setPostId((int) generatorService.generateSequence(POST_SEQUENCE));
            post2.setPostTitle("10 Must-Visit Places in Nepal");
            post2.setContent("Nepal is a beautiful country with diverse landscapes ranging from the high Himalayas to tropical jungles. Here are ten amazing places you should visit when traveling to Nepal.");

            post2.setImage(nepalTravelImageUrl);
            post2.setImageUrl(nepalTravelImageUrl);
            post2.setPublicId("nepal-travel-demo");

            post2.setPostDate(new Date(System.currentTimeMillis() - 86400000));
            post2.setUser(user2);
            post2.setCategory(travelCategory);
            post2.setComments(new java.util.HashSet<>());
            posts.add(post2);

            // Post 3
            Post post3 = new Post();
            post3.setPostId((int) generatorService.generateSequence(POST_SEQUENCE));
            post3.setPostTitle("Traditional Nepali Momo Recipe");
            post3.setContent("Momos are traditional Nepali dumplings that have become popular across South Asia. Learn how to make authentic chicken momos with this easy recipe.");

            post3.setImage(momoRecipeImageUrl);
            post3.setImageUrl(momoRecipeImageUrl);
            post3.setPublicId("momo-recipe-demo");

            post3.setPostDate(new Date(System.currentTimeMillis() - 172800000));
            post3.setUser(user3);
            post3.setCategory(foodCategory);
            post3.setComments(new java.util.HashSet<>());
            posts.add(post3);

            // Post 4
            Post post4 = new Post();
            post4.setPostId((int) generatorService.generateSequence(POST_SEQUENCE));
            post4.setPostTitle("Understanding MongoDB Relationships");
            post4.setContent("MongoDB offers flexible data modeling options. In this post, we'll discuss different types of relationships in MongoDB and when to use DBRef versus embedded documents.");

            post4.setImage(mongodbImageUrl);
            post4.setImageUrl(mongodbImageUrl);
            post4.setPublicId("mongodb-relationships-demo");

            post4.setPostDate(new Date(System.currentTimeMillis() - 259200000));
            post4.setUser(user1);
            post4.setCategory(techCategory);
            post4.setComments(new java.util.HashSet<>());
            posts.add(post4);

            // Post 5
            Post post5 = new Post();
            post5.setPostId((int) generatorService.generateSequence(POST_SEQUENCE));
            post5.setPostTitle("Trekking in the Annapurna Region");
            post5.setContent("The Annapurna Circuit is one of the most popular trekking routes in Nepal. Join me as I share my experiences and tips for this incredible adventure.");

            post5.setImage(annapurnaImageUrl);
            post5.setImageUrl(annapurnaImageUrl);
            post5.setPublicId("annapurna-trek-demo");

            post5.setPostDate(new Date(System.currentTimeMillis() - 345600000));
            post5.setUser(user2);
            post5.setCategory(travelCategory);
            post5.setComments(new java.util.HashSet<>());
            posts.add(post5);

            postDao.saveAll(posts);
            log.info("Posts created with Cloudinary URLs: {} " ,posts.size());
        } else {
            log.info("Posts already exist.");
        }
    }
}