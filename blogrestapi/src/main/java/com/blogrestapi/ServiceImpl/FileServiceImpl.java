package com.blogrestapi.ServiceImpl;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import com.blogrestapi.Exception.ImageInvalidException;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.blogrestapi.Service.FileService;
@Service
public class FileServiceImpl  implements FileService{
    private static  final List<String> extensions = List.of("jpg","jpeg","png","gif","jfif","webp");
    private static final  int MAX_SIZE = 20* 1024 *1024; // 20971520 bytes into 20MB
    @Override
    public String uploadFile(String path, MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path basicPath = Path.of(path);
        Path completePath = basicPath.resolve(fileName);
        try{
            if(!Files.exists(basicPath)){
                Files.createDirectories(basicPath);
            }
            Files.copy(file.getInputStream(),completePath,StandardCopyOption.REPLACE_EXISTING);
            return completePath.toString();
        }catch (IOException e){
            throw  new ImageInvalidException("Image failed to upload.");
        }
    }

    @Override
    public byte[] getFile(String fileDir) throws FileNotFoundException {
        Path path = Path.of(fileDir);
        try{
            if(Files.exists(path)){
                return Files.readAllBytes(path);
            }
        }catch(IOException e){
            throw new ImageInvalidException("Image not found");
        }
        return  new byte[0];
    }

    @Override
    public String deleteFile(String fileDir) throws IOException{
        Path path = Path.of(fileDir);
        if(Files.exists(path)){
            Files.delete(path);
            return "Success";
        }else{
            return "error";
        }
    }

    public MediaType determineMediaType(String filename) {

        String lowerfileName = filename.toLowerCase();
        if(lowerfileName.endsWith(".png")) return MediaType.IMAGE_PNG;
        if(lowerfileName.endsWith(".gif")) return MediaType.IMAGE_GIF;
        if(lowerfileName.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        return MediaType.IMAGE_JPEG;
    }



    private void validateImage(MultipartFile imageFile){
        String contentType = imageFile.getContentType();
        if(contentType == null || contentType.startsWith("/image")){
            throw new ImageInvalidException("Invalid file type: "+imageFile.getOriginalFilename());
        }
        if(imageFile == null || imageFile.isEmpty()){
            throw  new ImageInvalidException("Image is required.");
        }
        if(imageFile.getSize() > MAX_SIZE){
            throw new ImageInvalidException(imageFile.getOriginalFilename() + " exceeds " + MAX_SIZE + ".");
        }
        String imageName = imageFile.getOriginalFilename();
        String extension = imageName.substring(imageName.lastIndexOf(".")+1).toLowerCase();
        if(!extensions.contains(extension)){
            throw new ImageInvalidException("Only JPG, JPEG, PNG, JFIF and GIF files are allowed.");
        }
    }

}
