package com.blogrestapi.Controller;

import com.blogrestapi.Config.AppConstant;
import com.blogrestapi.DTO.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.blogrestapi.DTO.CommentDTO;
import com.blogrestapi.Service.CommentService;

import java.util.List;


@RestController
@RequestMapping("/api")
public class CommentController {
    @Autowired
    private CommentService commentService;

    @PostMapping("/comments/user/{userId}/post/{postId}")
    public ResponseEntity<CommentDTO> createComment(
        @RequestBody CommentDTO commentDTO,
        @PathVariable int userId,
        @PathVariable int postId
    ) {
        CommentDTO comment = this.commentService.createComments(commentDTO, userId, postId);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @PutMapping("/comments/{commentId}/user/{userId}/post/{postId}")
    public ResponseEntity<CommentDTO> updateComment(
        @PathVariable int commentId,
        @RequestBody CommentDTO commentDTO,
        @PathVariable int userId,
        @PathVariable int postId
    ) {
        CommentDTO updateCommentDTO = this.commentService.updateComment(commentId, commentDTO, userId, postId);
        return ResponseEntity.ok().body(updateCommentDTO);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable int commentId) {
        CommentDTO commentDTO = this.commentService.findCommentById(commentId);
        this.commentService.deleteComment(commentId);
        return ResponseEntity.status(HttpStatus.OK).body(commentDTO);
    }

    @GetMapping("/comments/post/{postId}")
    public ResponseEntity<?> getComments(@PathVariable(value = "postId")int postId,
                                         @RequestParam(value = "pageNumber",required = false,defaultValue = AppConstant.PAGE_NUMBER)int pageNumber,
                                         @RequestParam(value = "pageSize",required = false,defaultValue = AppConstant.PAGE_SIZE)int pageSize,
                                         @RequestParam(value = "sortBy",required = false,defaultValue ="commentId")String sortBy,
                                         @RequestParam(value = "sortDir", defaultValue = AppConstant.SORT_DIR, required = false) String sortDir){
        PageResponse<CommentDTO> getComment =this.commentService.getCommentByPostId(postId,pageNumber,pageSize,sortBy,sortDir);
        return ResponseEntity.status(HttpStatus.OK).body(getComment);
    }
}
