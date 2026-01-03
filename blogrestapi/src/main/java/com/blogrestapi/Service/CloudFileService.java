package com.blogrestapi.Service;

import com.blogrestapi.DTO.CloudinaryResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public interface CloudFileService {
    String uploadFile(MultipartFile imagFile)throws IOException;
    String uploadFile(MultipartFile file, String folder) throws IOException;

    CloudinaryResponse uploadFileWithDetails(MultipartFile file) throws IOException;

    // NEW: Upload with folder and return complete CloudinaryResponse
    CloudinaryResponse uploadFileWithDetails(MultipartFile file, String folder) throws IOException;

    String deleteFile(String publicIdOrUrl)throws IOException;


    String getFileUrl(String publicId);
    Map<String, Object> getFileDetails(String publicId) throws IOException,Exception;
    boolean isImageFile(MultipartFile file);
    boolean isVideoFile(MultipartFile file);
    boolean isDocumentFile(MultipartFile file);
    void validateFile(MultipartFile file);
}
