package com.blogrestapi.Security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
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

        log.info("=== COOKIE SETUP ===");
        log.info("Request Origin: {}", request.getHeader("Origin"));
        log.info("Request Host: {}", request.getHeader("Host"));
        log.info("Is Secure Request: {}", request.isSecure());


       String origin = request.getHeader("Origin");
       boolean isProduction = origin != null && (origin.contains("onrender.com") || origin.startsWith("https://"));

        log.info("Setting cookie for origin: {}, Production: {}", origin, isProduction);

        if (isProduction) {
//            // PRODUCTION: Render deployment (HTTPS)
//            String cookieHeader = String.format(
//                    "token=%s; Path=/; Max-Age=%d; HttpOnly; Secure; SameSite=None",
//                    token,
//                    24 * 60 * 60
//            );
//            response.addHeader("Set-Cookie", cookieHeader);
            ResponseCookie cookie = ResponseCookie.from("token",token)
                    .httpOnly(true)
                    .secure(true)
                    .maxAge(86400)
                    .sameSite("None")
                    .path("/")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE,cookie.toString());
            log.info("Set production cookie with SameSite=None");
        } else {
            // DEVELOPMENT: Localhost
            Cookie cookie = new Cookie("token", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // false for HTTP localhost
            cookie.setPath("/");
            cookie.setMaxAge(24 * 60 * 60);
            response.addCookie(cookie);
            log.info("Set development cookie");
        }

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");

        Map<String,Object> res = new HashMap<>();
        res.put("username",userDetails.getUsername());
        res.put("message","Login Successful");
        request.setAttribute("AUTH_RESPONSE_DATA",res);
    }
}
