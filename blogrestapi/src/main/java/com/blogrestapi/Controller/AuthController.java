package com.blogrestapi.Controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.blogrestapi.Dao.UserDao;
import com.blogrestapi.Entity.User;
import com.blogrestapi.Exception.ResourceNotFoundException;
import com.blogrestapi.Security.JwtAuthenticationSuccessHandler;
import com.blogrestapi.ServiceImpl.FileServiceImpl;
import com.blogrestapi.ValidationGroup.CreateUserGroup;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.blogrestapi.DTO.JwtRequest;
import com.blogrestapi.DTO.UserDTO;
import com.blogrestapi.Security.JWTTokenHelper;
import com.blogrestapi.Security.UserDetailService;
import com.blogrestapi.Service.UserService;

import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {
    private final JWTTokenHelper jwtTokenHelper;
    private final AuthenticationManager authenticationManager;
    private final UserDetailService userDetailService;
    private final  UserService userService;
    private final UserDao userDao;
    @Value("${project.users.image}")
    private String imagePath;
    private final FileServiceImpl fileService;
    private final JwtAuthenticationSuccessHandler successHandler;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody JwtRequest request,
            BindingResult result,
            HttpServletResponse servletResponse,
            HttpServletRequest servletRequest) {
        if(result.hasErrors()){
            Map<String,Object> errorRes = new HashMap<>();
            result.getFieldErrors().forEach(err->
                    errorRes.put(err.getField(),err.getDefaultMessage()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorRes);
        }
        try{
            Authentication authentication = this.authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            this.successHandler.onAuthenticationSuccess(servletRequest,servletResponse,authentication);
            User user = this.userDao.findByUsername(request.getUsername()).orElseThrow(
                    ()-> new ResourceNotFoundException("username not found in database")
            );
            Object attribute = servletRequest.getAttribute("AUTH_RESPONSE_DATA");
            Map<String,Object> responseData = null;
            if(attribute instanceof Map<?,?>){
                responseData =(Map<String, Object>) attribute;
            }else{
                responseData = new HashMap<>();
            }
            responseData.put("userId",user.getId());

            return ResponseEntity.status(HttpStatus.OK).body(responseData);
        }catch (Exception e){
            Map<String,String> errorResponse =  new HashMap<>();
            errorResponse.put("message","Invalid email or password.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Validated(CreateUserGroup.class) @RequestPart("user") UserDTO userDTO,
                                      BindingResult result,
                                      @RequestPart(value = "image",required = false)MultipartFile imageFile)
    {
        Map<String,Object> response=new HashMap<>();
        if (result.hasErrors()) {
            Map<String,Object> error=new HashMap<>();
            result.getFieldErrors().forEach(f->error.put(f.getField(), f.getDefaultMessage()));
            response.put("status","BAD_REQUEST(400)");
            response.put("message",error);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        UserDTO saveUser = this.userService.registerNewUser(userDTO);
        if(imageFile != null && !imageFile.isEmpty()){
            saveUser = this.userService.uploadImageInCloud(imageFile, saveUser.getId());
        }
        response.put("message", "User inserted successfully");
        response.put("data", saveUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    //helper method
    private String getUserImagePath(Integer userId){
        return "/user/"+ userId + "/fetchImage";
    }
}
