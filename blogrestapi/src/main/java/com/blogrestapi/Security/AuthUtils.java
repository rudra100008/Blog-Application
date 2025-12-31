package com.blogrestapi.Security;

import com.blogrestapi.Dao.UserDao;
import com.blogrestapi.Entity.User;
import com.blogrestapi.Exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthUtils {
    private final UserDao userDao;

    public User getLoggedInUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(!authentication.isAuthenticated()){
            throw new IllegalArgumentException("No authenticated user found.");
        }
        return userDao.findByUsername(authentication.getName())
                .orElseThrow(()-> new ResourceNotFoundException(String.format("%s is not found ",authentication.getName())));
    }
}
