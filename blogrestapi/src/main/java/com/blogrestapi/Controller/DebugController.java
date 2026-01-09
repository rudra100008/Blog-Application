package com.blogrestapi.Controller;

import com.blogrestapi.Security.JWTTokenHelper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final JWTTokenHelper jwtTokenHelper;

    @GetMapping("/cookies")
    public ResponseEntity<?> debugCookies(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Check cookies
        if (request.getCookies() != null) {
            Map<String, String> cookies = new HashMap<>();
            for (Cookie cookie : request.getCookies()) {
                cookies.put(cookie.getName(), cookie.getValue());
            }
            response.put("cookies", cookies);
        } else {
            response.put("cookies", "No cookies received");
        }

        // Check headers
        Map<String, String> headers = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            headers.put(headerName, request.getHeader(headerName));
        }
        response.put("headers", headers);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Check authentication
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        response.put("authenticated", auth != null && auth.isAuthenticated());
        response.put("principal", auth != null ? auth.getPrincipal() : null);
        response.put("name", auth != null ? auth.getName() : null);

        return ResponseEntity.ok(response);
    }
}