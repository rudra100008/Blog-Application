package com.blogrestapi.Security;

import java.io.IOException;

import com.blogrestapi.Service.TokenBlackListService;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final  UserDetailService userDetailService;
    private final JWTTokenHelper jwtTokenHelper;
    private final  TokenBlackListService tokenBlackListService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();

        return path.startsWith("/api/login")
                || path.startsWith("/api/register")
                || path.startsWith("/swagger-ui/**")
                || path.startsWith("/v3/api-docs/**")
                || path.startsWith("/swagger-ui.html");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String username = null;
            String token = null;
            if (request.getCookies() != null) {
                log.info("==== Jwt Filter Debug ====");
                log.info("Cookie found:{} ", request.getCookies().length);
                for (Cookie cookie : request.getCookies()) {
                    log.info("Cookie:{} = {}", cookie.getName(), cookie.getValue());
                    if ("token".equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isEmpty()) {
                        token = cookie.getValue();
                        break;
                    }
                }
            }

            if (token != null) {
                username = jwtTokenHelper.getUsernameFromToken(token);
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = this.userDetailService.loadUserByUsername(username);
                    if (this.jwtTokenHelper.validateToken(token, userDetails)) {
                        UsernamePasswordAuthenticationToken authentication
                                = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    } else {
                        log.info("Invalid jwt token");
                    }
                } else {
                    log.info("JWT token is null or does not start with Bearer");
                }
            }

            // Continue the filter chain if no exception occurred
            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException e) {
            log.error("JWT token expired", e);
            sendErrorResponse(response, "token_expired", "Token has expired. Please login again", HttpServletResponse.SC_UNAUTHORIZED);

        } catch (SecurityException e) {
            log.error("Security exception", e);
            sendErrorResponse(response, "unauthorized", "You are not authorized to access this", HttpServletResponse.SC_UNAUTHORIZED);

        } catch (MalformedJwtException e) {
            log.error("Malformed JWT token", e);
            sendErrorResponse(response, "invalid_token", "Invalid token format", HttpServletResponse.SC_UNAUTHORIZED);

        } catch (Exception e) {
            log.error("Authentication error", e);
            sendErrorResponse(response, "authentication_error", "Authentication failed", HttpServletResponse.SC_UNAUTHORIZED);
        }
    }

    //helper method
    private void sendErrorResponse(HttpServletResponse response,String error ,String message,int status) throws  IOException{

        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write(String.format("{\"error\" : \"%s\" , \"message\" : \"%s\"} ",error,message));
    }
    
}
