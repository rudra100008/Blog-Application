package com.blogrestapi.DTO;




import com.blogrestapi.Entity.Role;

import com.blogrestapi.ValidationGroup.CreateUserGroup;
import com.blogrestapi.ValidationGroup.UpdateUserGroup;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Integer id;

    @NotEmpty(groups = CreateUserGroup.class,message = "Required!")
    private String username;

    @NotEmpty(groups = CreateUserGroup.class,message = "Required!")
    @Email(groups = CreateUserGroup.class,message = "Invalid email format")
    private String email;

    @NotEmpty( groups = CreateUserGroup.class, message = "Required!")
    @Null(groups = UpdateUserGroup.class)
    @Size(groups = CreateUserGroup.class , min=3,max=16,message = "Password should have less than 3 and greater than 16 characters")
    private String password;
    private String image;
    private String imageUrl;
    private String publicId;
    @NotEmpty(groups = CreateUserGroup.class,message = "Required!")
    @Pattern(groups = CreateUserGroup.class,regexp = "^\\d{10}$",message = "Phone number must  have 10 digits")
    private String phoneNumber;
    @Size(groups = CreateUserGroup.class,min=10,max=600,message = "Description must be between 10 and 500 characters ")
    private String description;
    private boolean isEnable;

    private Role role;

    @JsonIgnore
    public String getPassword(){
        return this.password;
    }
    @JsonProperty
    public void setPassword(String password)
    {
        this.password=password;
    }
}
