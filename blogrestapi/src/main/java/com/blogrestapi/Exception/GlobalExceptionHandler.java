package com.blogrestapi.Exception;

import java.security.SignatureException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e,WebRequest request) {
        e.printStackTrace();
       return buildExceptionResponse(
               HttpStatus.INTERNAL_SERVER_ERROR,
               String.format("Internal Server Error: %s",e.getMessage()),
               request
       );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handlerUserNotFound(ResourceNotFoundException e,WebRequest request) {
        return buildExceptionResponse(
                HttpStatus.NOT_FOUND,
                String.format(e.getMessage()),
                request
        );
    }

    @ExceptionHandler(AlreadyExistsException.class)
    public ResponseEntity<?> handleAlreadyExist(AlreadyExistsException e,WebRequest request) {
        return buildExceptionResponse(
                HttpStatus.BAD_REQUEST,
                String.format(e.getMessage()),
                request
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation(DataIntegrityViolationException ex,WebRequest request) {

        return buildExceptionResponse(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e,WebRequest request) {
        return buildExceptionResponse(
                HttpStatus.BAD_REQUEST,
                e.getMessage(),
                request
        );
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<?> handleUnauthorizedException(AuthorizationDeniedException ex,WebRequest request) {
      return buildExceptionResponse(
              HttpStatus.UNAUTHORIZED,
              ex.getMessage(),
              request
      );
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<?> handleDisabledException(DisabledException e,WebRequest request) {
        return buildExceptionResponse(
                HttpStatus.BAD_REQUEST,
                "User is disabled",
                request
        );
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<?> handleJwtException(JwtException e,WebRequest request) {
        return buildExceptionResponse(
                HttpStatus.UNAUTHORIZED,
                "Invalid jwt token",
                request
        );
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<?> handleExpiredJwtException(ExpiredJwtException  e,WebRequest request) {
        return buildExceptionResponse(
                HttpStatus.UNAUTHORIZED,
                "Token is expired",
                request
        );
    }
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<?> handleSecurityException(SecurityException e,WebRequest request){
        return buildExceptionResponse(
                HttpStatus.UNAUTHORIZED,
                e.getMessage(),
                request
        );
    }

    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<?> handleMalformedJwtException(MalformedJwtException e,WebRequest request) {
        return buildExceptionResponse(
                HttpStatus.BAD_REQUEST,
                String.format("Invalid JWT token format: %s",e.getMessage()),
                request
        );
    }

    @ExceptionHandler(UnsupportedJwtException.class)
    public ResponseEntity<?> handleUnsupportedJwtException(UnsupportedJwtException e,WebRequest request) {
        return buildExceptionResponse(
                HttpStatus.BAD_REQUEST,
                String.format("JWT token is unsupported: %s",e.getMessage()),
                request
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException e,WebRequest request) {
        return buildExceptionResponse(
                HttpStatus.BAD_REQUEST,
                e.getMessage(),
                request
        );
    }
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException bad,WebRequest request){

        return buildExceptionResponse(
                HttpStatus.UNAUTHORIZED,
                "Invalid username or password",
                request
        );
    }

    @ExceptionHandler(ImageInvalidException.class)
    public ResponseEntity<?> handleImageInvalidException(ImageInvalidException e,WebRequest request){

        return buildExceptionResponse(
                HttpStatus.BAD_REQUEST,
                e.getMessage(),
                request
        );
    }

    //helper method

    private ResponseEntity<?>  buildExceptionResponse(HttpStatus status, String message, WebRequest request){
        Map<String,Object> response = new HashMap<>();
        response.put("status", status);
        response.put("message",message);
        response.put("timeStamp", LocalDateTime.now());
        response.put("path",request.getDescription(false));
        return  ResponseEntity.status(status).body(response);
    }
}
