package com.blogrestapi.Security;

import java.io.IOException;

import com.blogrestapi.Service.TokenBlackListService;
import org.springframework.beans.factory.annotation.Autowired;
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
public class JwtAuthencticationFilter extends OncePerRequestFilter {
    @Autowired
    private UserDetailService userDetailService;
    @Autowired
    private JWTTokenHelper jwtTokenHelper;
    @Autowired
    private TokenBlackListService tokenBlackListService;
    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request, 
        @NonNull HttpServletResponse response, 
        @NonNull FilterChain filterChain)
            throws ServletException, IOException {
      // 1. Get the token from the request header
       final String authorizationHeader=request.getHeader("Authorization");
       // the token we get from the request.getHeader() is in this format->Bearer ASJDLAJDK
       String username=null;
       String token=null;
       if (authorizationHeader !=null && authorizationHeader.startsWith("Bearer ")) {
           token= authorizationHeader.substring(7);
           if (tokenBlackListService.isTokenBlackListed(token)) {
               response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
               response.getWriter().write("Token has been invalidated");
               return; // Exit if the token is blacklisted
           }
           if(jwtTokenHelper.isTokenExpired(token)){
               response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
               response.getWriter().write("Token has expired");
               return; //exit if the token has expired
           }
           try {
            username=this.jwtTokenHelper.getUsernameFromToken(token);
           }catch(IllegalArgumentException i)
           {
            System.out.println("unable to get the jwt token");
           }catch(ExpiredJwtException e){
            System.out.println("Jwt token has expired");
           }catch(MalformedJwtException mal){
            System.out.println("invalid jwt");
           } catch (Exception e) {
             System.out.println(e.getLocalizedMessage());
           }

          
       }else{
        filterChain.doFilter(request, response);
        System.out.println("jwt token is null or doesnot starts with bearer");
        return;
       }
       //here securityContextHolder holds the securityContext it means it hold the details about the user 
       //that is interacting with the application
       //when securityContect is equals to null then the user is not logged in 
       if (username != null && SecurityContextHolder.getContext().getAuthentication()==null) {
        //this loades the userdetails form the database by using the username
        UserDetails userDetails=this.userDetailService.loadUserByUsername(username);
        //here the validate token validates the user by comparing with the username in userDetails and username in token 
        // and validate token also check whether the token is exppired or not
        if (this.jwtTokenHelper.validateToken(token, userDetails)) {
            //here authentication represents the authenticated(verified) user and this 
            //  SecurityContextHolder.getContext().setAuthentication(authentication); set the authenticated user in
            // the securityContext.This effectively tells Spring Security that the user is now authenticated for this request.
            UsernamePasswordAuthenticationToken  authentication
            =new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
           authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
           SecurityContextHolder.getContext().setAuthentication(authentication);
        }else{
            System.out.println("Invalid jwt token");
        }
       }else{
        System.out.println("JWT token is null or does not start with Bearer");
       }
       filterChain.doFilter(request, response);

    }
    
}
