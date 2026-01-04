package com.blogrestapi.Config;

import com.blogrestapi.DTO.CommentDTO;
import com.blogrestapi.DTO.DisLikeDTO;
import com.blogrestapi.DTO.LikeDTO;
import com.blogrestapi.Entity.Comment;
import com.blogrestapi.Entity.DisLike;
import com.blogrestapi.Entity.Like;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class AppConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        // Strict mode to prevent ambiguous mappings
        modelMapper.getConfiguration()
                .setAmbiguityIgnored(false)
                .setFieldMatchingEnabled(true)
                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE);

        // Configure Comment to CommentDTO mapping
        modelMapper.addMappings(new PropertyMap<Comment, CommentDTO>() {
            @Override
            protected void configure() {
                map().setId(source.getCommentId());
                map().setComments(source.getComments());
                map().setUserId(source.getUser().getId());
                map().setPostId(source.getPost().getPostId());
            }
        });

        // Configure CommentDTO to Comment mapping
        modelMapper.addMappings(new PropertyMap<CommentDTO, Comment>() {
            @Override
            protected void configure() {
                map().setCommentId(source.getId());
                map().setComments(source.getComments());
                // Note: Post and User will be set separately in service layer
            }
        });

        // Configure Like to LikeDTO mapping
        modelMapper.addMappings(new PropertyMap<Like, LikeDTO>() {
            @Override
            protected void configure() {
                map().setId(source.getId());
                // Map User object to userId integer
                using(ctx -> ((Like) ctx.getSource()).getUser() != null ?
                        ((Like) ctx.getSource()).getUser().getId() : null)
                        .map(source).setUserId(null);
                // Map Post object to postId integer
                using(ctx -> ((Like) ctx.getSource()).getPost() != null ?
                        ((Like) ctx.getSource()).getPost().getPostId() : null)
                        .map(source).setPostId(null);
            }
        });

        // Configure LikeDTO to Like mapping (partial - only for ID)
        modelMapper.addMappings(new PropertyMap<LikeDTO, Like>() {
            @Override
            protected void configure() {
                map().setId(source.getId());
                // User and Post will be set separately in service layer
            }
        });

        // Configure DisLike to DisLikeDTO mapping
        modelMapper.addMappings(new PropertyMap<DisLike, DisLikeDTO>() {
            @Override
            protected void configure() {
                map().setId(source.getId());
                // Map User object to userId integer
                using(ctx -> ((DisLike) ctx.getSource()).getUser() != null ?
                        ((DisLike) ctx.getSource()).getUser().getId() : null)
                        .map(source).setUserId(null);
                // Map Post object to postId integer
                using(ctx -> ((DisLike) ctx.getSource()).getPost() != null ?
                        ((DisLike) ctx.getSource()).getPost().getPostId() : null)
                        .map(source).setPostId(null);
            }
        });

        // Configure DisLikeDTO to DisLike mapping (partial - only for ID)
        modelMapper.addMappings(new PropertyMap<DisLikeDTO, DisLike>() {
            @Override
            protected void configure() {
                map().setId(source.getId());
                // User and Post will be set separately in service layer
            }
        });

        return modelMapper;
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}