package com.blogrestapi.Controller;

import com.blogrestapi.DTO.DisLikeDTO;
import com.blogrestapi.DTO.LikeDTO;
import com.blogrestapi.Service.DisLikeService;
import com.blogrestapi.Service.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class LikeDisLikeController {

    private final LikeService likeService;
    private final DisLikeService disLikeService;

    @PostMapping("/likePost")
    public ResponseEntity<?> likePost(
            @RequestParam("userId") int userId,
            @RequestParam("postId") int postId
    ) {
        try {
            LikeDTO result = this.likeService.postLike(userId, postId);
            boolean nowLiked = result != null; // null = toggled off
            long likeCount = this.likeService.countLikeForPost(postId);

            return ResponseEntity.ok(Map.of(
                    "liked", nowLiked,
                    "likeCount", likeCount
            ));
        } catch (Exception e) {
            log.error("Error toggling like for user {} on post {}: {}", userId, postId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to toggle like: " + e.getMessage()));
        }
    }

    @PostMapping("/dislikePost")
    public ResponseEntity<?> dislikePost(
            @RequestParam("userId") int userId,
            @RequestParam("postId") int postId
    ) {
        try {
            DisLikeDTO result = this.disLikeService.postDelete(userId, postId);
            boolean nowDisliked = result != null;
            long dislikeCount = this.disLikeService.countDislikes(postId);

            return ResponseEntity.ok(Map.of(
                    "disliked", nowDisliked,
                    "dislikeCount", dislikeCount
            ));
        } catch (Exception e) {
            log.error("Error toggling dislike for user {} on post {}: {}", userId, postId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to toggle dislike: " + e.getMessage()));
        }
    }

   // get count of like and dislike
    @GetMapping("/posts/{postId}/reactions")
    public ResponseEntity<?> getReactions(@PathVariable int postId) {
        try {
            long likeCount = this.likeService.countLikeForPost(postId);
            long dislikeCount = this.disLikeService.countDislikes(postId);
            return ResponseEntity.ok(Map.of(
                    "likeCount", likeCount,
                    "dislikeCount", dislikeCount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to get reactions: " + e.getMessage()));
        }
    }
}