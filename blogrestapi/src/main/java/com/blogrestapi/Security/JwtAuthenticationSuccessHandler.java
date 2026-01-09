package com.blogrestapi.Security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final JWTTokenHelper jwtTokenHelper;
    private final UserDetailsService userDetailsService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        UserDetails userDetails = this.userDetailsService.loadUserByUsername(authentication.getName());
        String token = jwtTokenHelper.generateToken(userDetails);
        
        String environment = System.getenv("ENV") != null ? System.getenv("ENV") : "dev";
        boolean isProduction = "prod".equals(environment) || "production".equals(environment);

        // Create cookie
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(isProduction);
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60);

        // CRITICAL: Different SameSite settings for different environments
        if (isProduction) {
            // For production with HTTPS
            cookie.setAttribute("SameSite", "None");
            // Ensure domain is set if using cross-origin
            // cookie.setDomain("yourdomain.com");
        } else {
            // For local development
            cookie.setAttribute("SameSite", "Lax");
        }

        response.addCookie(cookie);

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");

        Map<String,Object> res = new HashMap<>();
        res.put("username",userDetails.getUsername());
        res.put("message","Login Successful");
        request.setAttribute("AUTH_RESPONSE_DATA",res);
    }
}
