package com.blogrestapi.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.blogrestapi.DTO.UserDTO;
import org.springframework.web.multipart.MultipartFile;


@Service
public interface UserService {
    List<UserDTO> getUsers(); 
    UserDTO getUserById(int id);
    UserDTO registerNewUser(UserDTO userDTO);
    UserDTO createUser(UserDTO userDTO); 
    UserDTO updateUserById(int id, UserDTO userDTO);
    void deleteUserById(int id);
    UserDTO uploadImage(MultipartFile file,Integer userId);
    byte[] fetchUserImage(Integer userId);
}
