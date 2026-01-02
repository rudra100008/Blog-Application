package com.blogrestapi.Service;

import java.awt.*;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
@Service
public interface FileService {
    String uploadFile(String path,MultipartFile file)throws IOException;
    byte[] getFile(String fileDir)throws FileNotFoundException;
    String deleteFile(String fileDir)throws IOException;

    MediaType determineMediaType(String imageName);

}
