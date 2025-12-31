package com.blogrestapi.ServiceImpl;


import java.io.File;
import java.io.IOException;
import java.util.List;

import java.util.stream.Collectors;

import com.blogrestapi.Exception.ImageInvalidException;
import com.blogrestapi.Exception.UnauthorizedException;
import com.blogrestapi.Security.AuthUtils;
import com.blogrestapi.Service.FileService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.blogrestapi.Config.AppConstant;
import com.blogrestapi.DTO.UserDTO;
import com.blogrestapi.Dao.RoleDao;
import com.blogrestapi.Dao.UserDao;
import com.blogrestapi.Entity.Role;
import com.blogrestapi.Entity.User;
import com.blogrestapi.Exception.AlreadyExistsException;
import com.blogrestapi.Exception.ResourceNotFoundException;
import com.blogrestapi.Service.UserService;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private  final UserDao userDao;
    private final ModelMapper modelMapper;
    private final SequenceGeneratorService sequence;
    private final BCryptPasswordEncoder encoder;
    private final  RoleDao roleDao;
    private final FileService fileService;
    private final AuthUtils authUtils;
    @Value("${project.users.image}")
    private  static String FILE_PATH;

    @Override
    public List<UserDTO> getUsers() {
        return this.userDao.findAll().stream()
         .map(user->modelMapper.map(user, UserDTO.class))
        .collect(Collectors.toList());
    }

    @Override
    public UserDTO getUserById(int id) {
        return this.userDao.findById(id).map(user->modelMapper.map(user,UserDTO.class))
        .orElseThrow(()->new ResourceNotFoundException("User not found with id: "+id));
    }

    @Override
    public UserDTO createUser(UserDTO userDTO) {
        userDTO.setId((int) this.sequence.generateSequence("user_sequence"));//this generates news id
        if (this.userDao.existsByUsername(userDTO.getUsername())) {
            throw new AlreadyExistsException("username is already used");
        }
        if (this.userDao.existsByEmail(userDTO.getEmail())) {
            throw new AlreadyExistsException("email is already used");
        }
        if ( userDTO.getRole()==null ) {
            Role role=new Role(2,"ROLE_USER");
            userDTO.setRole(role);
        }
        if (userDTO.getImage()== null){
            userDTO.setImage("default.jpg");
        }else{
            userDTO.setImage(userDTO.getImage());
        }
      
        userDTO.setPassword(encoder.encode(userDTO.getPassword())); 
        User user=modelMapper.map(userDTO, User.class);
        User savedUser=this.userDao.save(user);
        return modelMapper.map(savedUser,UserDTO.class);
    }

    @Override
    public UserDTO updateUserById(int id, UserDTO userDTO) {
        User user=this.userDao.findById(id).orElseThrow(()->new ResourceNotFoundException("User not found with id: "+id)); 
        if (!user.getUsername().equals(userDTO.getUsername()) && this.userDao.existsByUsername(userDTO.getUsername())  ) {
            throw new AlreadyExistsException("Username is already used");
        }
        if ( !user.getEmail().equals(userDTO.getEmail()) &&  this.userDao.existsByEmail(userDTO.getEmail())) {
            throw new AlreadyExistsException("Email is already used");
        }
        if ( user.getRole()==null ) {
            Role role=new Role(2,"ROLE_USER");
            user.setRole(role);
        }
       if(userDTO.getImage() != null && !userDTO.getImage().isEmpty() ){
           user.setImage(userDTO.getImage());
       }else{
          user.setImage(user.getImage());
       }
        if(!userDTO.getEmail().isEmpty()){
            user.setEmail(userDTO.getEmail());
        }
        if(!userDTO.getUsername().isEmpty()) {
            user.setUsername(userDTO.getUsername());
        }
        if(userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(encoder.encode(userDTO.getPassword()));
        }
        if(!userDTO.getPhoneNumber().isEmpty()){
            user.setPhoneNumber(userDTO.getPhoneNumber());
        }
        if(!userDTO.getDescription().isEmpty()){
            user.setDescription(userDTO.getDescription());
        }
       user.setEnable(true);
      User updateduser= this.userDao.save(user);
      return modelMapper.map(updateduser, UserDTO.class);

    }

    @Override
    public void deleteUserById(int id) {
        if (!this.userDao.existsById(id)) {
            throw new ResourceNotFoundException("User not found by id: "+id);
        }
       this.userDao.deleteById(id);
    }

    @Override
    public UserDTO uploadImage(MultipartFile file, Integer userId) {
        try{
            User user = validateUser(userId);
            String completePath = this.fileService.uploadFile(FILE_PATH,file);
            user.setImage(completePath);
            User savedUser = this.userDao.save(user);
            return this.modelMapper.map(savedUser,UserDTO.class);
        }catch(IOException e){
            throw new ImageInvalidException("Image uploading failed");
        }
    }

    @Override
    public byte[] fetchUserImage(Integer userId) {
        User user = validateUser(userId);
        try{
            return this.fileService.getFile(user.getImage());
        }catch (IOException e){
            throw new ImageInvalidException("Image fetching failed.");
        }
    }

    @Override
    public UserDTO registerNewUser(UserDTO userDTO) {
        User user=this.modelMapper.map(userDTO, User.class);
        if (this.userDao.existsByUsername(user.getUsername())) {
            throw new AlreadyExistsException("Username is already used");
        }
        if (this.userDao.existsByEmail(user.getEmail())) {
            throw new AlreadyExistsException("Email is already used");
        }
        if(user.getImage()== null){
            user.setImage("default.jpg");
        }else {
            user.setImage(user.getImage());
        }
        user.setId((int)this.sequence.generateSequence("user_sequence"));
        user.setPassword(this.encoder.encode(user.getPassword()));
        user.setEnable(true);

        Role role=this.roleDao.findById(AppConstant.NORMAL_USER).orElseThrow(()->
            new ResourceNotFoundException("The role not found  with id: "+AppConstant.NORMAL_USER)
         );
         user.setRole(role);
         User saveUser=this.userDao.save(user);
       return modelMapper.map(saveUser, UserDTO.class);
    }
   
   //helper method
    private User validateUser(Integer userId){
        User loggedInUser = this.authUtils.getLoggedInUser();
        if(loggedInUser.getId().equals(userId)){
            return loggedInUser;
        }else {
            throw  new UnauthorizedException("User is not authorized for this service.");
        }
    }

    
}
