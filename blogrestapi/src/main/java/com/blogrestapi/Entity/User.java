package com.blogrestapi.Entity;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User implements UserDetails {
    @MongoId
    private Integer id;
    private String username;
    private String email;
    private String password;
    private String image;
    private String imageUrl;
    private String publicId;
    private String phoneNumber;
    private String description;
    private boolean isEnable;
    @DBRef
    private List<Post> post = new ArrayList<>();
    
    @DBRef
    private Role role; // Keep as single Role
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role != null) {
            return List.of(new SimpleGrantedAuthority(role.getName()));
        }
        return new ArrayList<>(); // Return an empty collection if no role
    }

    @Override
    public String getPassword() {
        return password; // Return the password
    }

    @Override
    public String getUsername() {
        return username; // Return the username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Add logic as needed
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Add logic as needed
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Add logic as needed
    }

    @Override
    public boolean isEnabled() {
        return isEnable; // Use the isEnable field
    }
}
