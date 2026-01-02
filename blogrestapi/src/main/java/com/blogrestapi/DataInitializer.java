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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

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

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Application Started.......");
        createRole();
        createCategory();
        createUser();
        createPost();
    }

    private void createRole(){
        Optional<Role> findAdmin = this.roleDao.findRoleByName("ROLE_ADMIN");
        Optional<Role> findUser = this.roleDao.findRoleByName("ROLE_USER");
        List<Role> roles = new ArrayList<>();

        if (findAdmin.isEmpty()){
            roles.add(new Role((int)generatorService.generateSequence("role_sequence"),"ROLE_ADMIN"));
        }
        if(findUser.isEmpty()){
            roles.add(new Role((int)generatorService.generateSequence("role_sequence"),"ROLE_USER"));
        }
        if(!roles.isEmpty()){
            this.roleDao.saveAll(roles);
            System.out.println("Roles created: "+roles.toString());
        }else {
            System.out.println("Roles already exist.");
        }
    }

    private void createCategory(){
        if(categoryDao.count() == 0){
            List<Category> categories = new ArrayList<>();
            categories.add(new Category((int)generatorService.generateSequence("category_sequence"), "Technology", new ArrayList<>()));
            categories.add(new Category((int)generatorService.generateSequence("category_sequence"), "Lifestyle", new ArrayList<>()));
            categories.add(new Category((int)generatorService.generateSequence("category_sequence"), "Travel", new ArrayList<>()));
            categories.add(new Category((int)generatorService.generateSequence("category_sequence"), "Food", new ArrayList<>()));
            categories.add(new Category((int)generatorService.generateSequence("category_sequence"), "Health", new ArrayList<>()));

            categoryDao.saveAll(categories);
            System.out.println("Categories created: " + categories.size());
        } else {
            System.out.println("Categories already exist.");
        }
    }

    private void createUser(){
        if(userDao.count() == 0){
            List<User> users = new ArrayList<>();

            Role adminRole = roleDao.findRoleByName("ROLE_ADMIN").orElse(null);
            Role userRole = roleDao.findRoleByName("ROLE_USER").orElse(null);

            User admin = new User();
            admin.setId((int)generatorService.generateSequence("user_sequence"));
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
            user1.setId((int)generatorService.generateSequence("user_sequence"));
            user1.setUsername("john_doe");
            user1.setEmail("john.doe@example.com");
            user1.setPassword(passwordEncoder.encode("password123"));
            user1.setImage("john-avatar.jpg");
            user1.setPhoneNumber("+977-9812345678");
            user1.setDescription("Tech enthusiast and blogger");
            user1.setEnable(true);
            user1.setRole(userRole);
            user1.setPost(new ArrayList<>());
            users.add(user1);

            User user2 = new User();
            user2.setId((int)generatorService.generateSequence("user_sequence"));
            user2.setUsername("jane_smith");
            user2.setEmail("jane.smith@example.com");
            user2.setPassword(passwordEncoder.encode("password123"));
            user2.setImage("jane-avatar.jpg");
            user2.setPhoneNumber("+977-9823456789");
            user2.setDescription("Travel blogger and photographer");
            user2.setEnable(true);
            user2.setRole(userRole);
            user2.setPost(new ArrayList<>());
            users.add(user2);

            User user3 = new User();
            user3.setId((int)generatorService.generateSequence("user_sequence"));
            user3.setUsername("mike_wilson");
            user3.setEmail("mike.wilson@example.com");
            user3.setPassword(passwordEncoder.encode("password123"));
            user3.setImage("mike-avatar.jpg");
            user3.setPhoneNumber("+977-9834567890");
            user3.setDescription("Food critic and recipe creator");
            user3.setEnable(true);
            user3.setRole(userRole);
            user3.setPost(new ArrayList<>());
            users.add(user3);

            userDao.saveAll(users);
            System.out.println("Users created: " + users.size());
        } else {
            System.out.println("Users already exist.");
        }
    }

    private void createPost(){
        if(postDao.count() == 0){
            List<Post> posts = new ArrayList<>();
            String imageFile = "/src/main/resources/image/";
            User user1 = userDao.findById(2).orElse(null);
            User user2 = userDao.findById(3).orElse(null);
            User user3 = userDao.findById(4).orElse(null);

            Category techCategory = categoryDao.findById(1).orElse(null);
            Category travelCategory = categoryDao.findById(3).orElse(null);
            Category foodCategory = categoryDao.findById(4).orElse(null);


            Post post1 = new Post();
            post1.setPostId((int)generatorService.generateSequence("post_sequence"));
            post1.setPostTitle("Introduction to Spring Boot REST API");
            post1.setContent("Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications. In this post, we'll explore how to build a RESTful API using Spring Boot and MongoDB.");
            post1.setImage(imagePath + "spring-boot-api.jpg");
            post1.setPostDate(new Date());
            post1.setUser(user1);
            post1.setCategory(techCategory);
            post1.setComments(new java.util.HashSet<>());
            posts.add(post1);

            // Post 2
            Post post2 = new Post();
            post2.setPostId((int)generatorService.generateSequence("post_sequence"));
            post2.setPostTitle("10 Must-Visit Places in Nepal");
            post2.setContent("Nepal is a beautiful country with diverse landscapes ranging from the high Himalayas to tropical jungles. Here are ten amazing places you should visit when traveling to Nepal.");
            post2.setImage(imagePath + "nepal-travel.jpg");
            post2.setPostDate(new Date(System.currentTimeMillis() - 86400000)); // 1 day ago
            post2.setUser(user2);
            post2.setCategory(travelCategory);
            post2.setComments(new java.util.HashSet<>());
            posts.add(post2);

            // Post 3
            Post post3 = new Post();
            post3.setPostId((int)generatorService.generateSequence("post_sequence"));
            post3.setPostTitle("Traditional Nepali Momo Recipe");
            post3.setContent("Momos are traditional Nepali dumplings that have become popular across South Asia. Learn how to make authentic chicken momos with this easy recipe.");
            post3.setImage(imagePath + "momo-recipe.jpg");
            post3.setPostDate(new Date(System.currentTimeMillis() - 172800000)); // 2 days ago
            post3.setUser(user3);
            post3.setCategory(foodCategory);
            post3.setComments(new java.util.HashSet<>());
            posts.add(post3);

            // Post 4
            Post post4 = new Post();
            post4.setPostId((int)generatorService.generateSequence("post_sequence"));
            post4.setPostTitle("Understanding MongoDB Relationships");
            post4.setContent("MongoDB offers flexible data modeling options. In this post, we'll discuss different types of relationships in MongoDB and when to use DBRef versus embedded documents.");
            post4.setImage(imagePath + "mongodb-relationships.jpg");
            post4.setPostDate(new Date(System.currentTimeMillis() - 259200000)); // 3 days ago
            post4.setUser(user1);
            post4.setCategory(techCategory);
            post4.setComments(new java.util.HashSet<>());
            posts.add(post4);

            // Post 5
            Post post5 = new Post();
            post5.setPostId((int)generatorService.generateSequence("post_sequence"));
            post5.setPostTitle("Trekking in the Annapurna Region");
            post5.setContent("The Annapurna Circuit is one of the most popular trekking routes in Nepal. Join me as I share my experiences and tips for this incredible adventure.");
            post5.setImage(imagePath+ "annapurna-trek.jpg");
            post5.setPostDate(new Date(System.currentTimeMillis() - 345600000)); // 4 days ago
            post5.setUser(user2);
            post5.setCategory(travelCategory);
            post5.setComments(new java.util.HashSet<>());
            posts.add(post5);

            postDao.saveAll(posts);
            System.out.println("Posts created: " + posts.size());
        } else {
            System.out.println("Posts already exist.");
        }
    }
}