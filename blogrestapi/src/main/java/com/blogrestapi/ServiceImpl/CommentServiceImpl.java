package com.blogrestapi.ServiceImpl;

import java.util.List;

import com.blogrestapi.Config.AppConstant;
import com.blogrestapi.DTO.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.blogrestapi.DTO.CommentDTO;
import com.blogrestapi.Dao.CommentDao;
import com.blogrestapi.Dao.PostDao;
import com.blogrestapi.Dao.UserDao;
import com.blogrestapi.Entity.Comment;
import com.blogrestapi.Entity.Post;
import com.blogrestapi.Entity.User;
import com.blogrestapi.Exception.ResourceNotFoundException;
import com.blogrestapi.Exception.UnauthorizedException;
import com.blogrestapi.Service.CommentService;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentServiceImpl implements CommentService {

    private final CommentDao commentDao;
    private final ModelMapper modelMapper;
    private final UserDao userDao;
    private final PostDao postDao;
    private final SequenceGeneratorService sequence;

    // ─────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────

    @Override
    public CommentDTO createComments(CommentDTO commentDTO, int userId, int postId) {
        User user = this.userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found by id: " + userId));
        this.postDao.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found by id: " + postId));

        commentDTO.setUserId(userId);
        commentDTO.setPostId(postId);
        commentDTO.setId((int) sequence.generateSequence("comment_sequence"));

        Comment comment = modelMapper.map(commentDTO, Comment.class);
        Comment savedComment = this.commentDao.save(comment);

        // Enrich with user info so the frontend doesn't need a separate /users/{id} call
        CommentDTO result = modelMapper.map(savedComment, CommentDTO.class);
        return enrichCommentDTO(result, user);
    }

    // ─────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────

    @Override
    public CommentDTO updateComment(int commentId, CommentDTO commentDTO, int userId, int postId) {
        Comment existingComment = this.commentDao.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found by id: " + commentId));
        User user = this.userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found by id: " + userId));
        Post post = this.postDao.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found by id: " + postId));

        // Use .equals() for Integer comparison — never == for object types
        if (!existingComment.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("User(" + user.getUsername() + ") cannot change this comment");
        }
        if (existingComment.getPost().getPostId() != post.getPostId()) {
            throw new UnauthorizedException("You cannot change the comment of Post(" + post.getPostTitle() + ")");
        }

        commentDTO.setId(commentId);
        commentDTO.setPostId(postId);
        commentDTO.setUserId(userId);
        modelMapper.map(commentDTO, existingComment);

        Comment savedComment = this.commentDao.save(existingComment);
        CommentDTO result = modelMapper.map(savedComment, CommentDTO.class);
        return enrichCommentDTO(result, user);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────

    @Override
    public void deleteComment(int commentId) {
        if (!this.commentDao.existsById(commentId)) {
            throw new ResourceNotFoundException("Comment not found with id: " + commentId);
        }
        this.commentDao.deleteById(commentId);
    }

    // ─────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────

    @Override
    public PageResponse<CommentDTO> getCommentByPostId(int postId, int pageNumber, int pageSize,
                                                       String sortBy, String sortDir) {
        Post getPost = this.postDao.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find the post by id: " + postId));

        // FIX: compare the parameter, not the constant against itself
        Sort sort = "ascending".equalsIgnoreCase(sortDir)
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<Comment> page = this.commentDao.findCommentByPost(getPost, pageable);

        // Enrich each comment DTO with username + userImageUrl so the frontend
        // can render avatars without firing a separate /users/{id} call per comment
        List<CommentDTO> commentDTOs = page.getContent().stream()
                .map(comment -> {
                    CommentDTO dto = modelMapper.map(comment, CommentDTO.class);
                    if (comment.getUser() != null) {
                        enrichCommentDTO(dto, comment.getUser());
                    }
                    return dto;
                })
                .toList();

        return new PageResponse<>(
                "OK(200)",
                commentDTOs,
                pageSize,
                pageNumber,
                page.getTotalPages(),
                page.getTotalElements(),
                page.isLast()
        );
    }

    @Override
    public CommentDTO findCommentById(int commentId) {
        Comment comment = this.commentDao.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
        CommentDTO dto = modelMapper.map(comment, CommentDTO.class);
        if (comment.getUser() != null) {
            enrichCommentDTO(dto, comment.getUser());
        }
        return dto;
    }

    @Override
    public List<CommentDTO> getAllComments() {
        throw new UnsupportedOperationException("Unimplemented method 'getAllComments'");
    }



   // Private methods


    private CommentDTO enrichCommentDTO(CommentDTO dto, User user) {
        dto.setUsername(user.getUsername());
        dto.setUserImageUrl(user.getImageUrl());
        return dto;
    }
}