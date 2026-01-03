package com.blogrestapi.ServiceImpl;

import com.blogrestapi.DTO.CloudinaryResponse;
import com.blogrestapi.Exception.ImageInvalidException;
import com.blogrestapi.Service.CloudFileService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudServiceImpl implements CloudFileService {
    private final Cloudinary cloudinary;

    private static final List<String> ALLOWED_IMAGE_EXTENSION = List.of(
            "jpg","jpeg","png","gif","bmp","webp","svg","ico","tiff","tif"
    );
    private static final List<String> ALLOWED_VIDEO_EXTENSIONS = List.of(
            "mp4", "mov", "avi", "wmv", "flv", "mkv", "webm"
    );

    private static final List<String> ALLOWED_DOCUMENT_EXTENSIONS = List.of(
            "pdf", "doc", "docx", "txt", "rtf", "odt", "xls", "xlsx", "ppt", "pptx"
    );

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
    private static final long MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB

    @Override
    public String uploadFile(MultipartFile imagFile) throws IOException {
        return uploadFile(imagFile,null);
    }

    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
      CloudinaryResponse cloudinaryResponse = uploadFileWithDetails(file,folder);
      return cloudinaryResponse.getSecureUrl();
    }

    @Override
    public CloudinaryResponse uploadFileWithDetails(MultipartFile file) throws IOException {
        return uploadFileWithDetails(file,null);
    }

    @Override
    public CloudinaryResponse uploadFileWithDetails(MultipartFile file, String folder) throws IOException {
        validateFile(file);

        // Determine resource type
        String resourceType = "auto";
        if (isVideoFile(file)) {
            resourceType = "video";
        } else if (isDocumentFile(file)) {
            resourceType = "raw";
        }

        String publicId = generatePublicId(file);

        Map<String, Object> uploadOptions = new HashMap<>();
        if (folder != null && !folder.trim().isEmpty()) {
            uploadOptions.put("folder", folder);
        }
        uploadOptions.put("resource_type", resourceType);
        uploadOptions.put("public_id", publicId);


        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                uploadOptions
        );


        return CloudinaryResponse.builder()
                .publicId((String) uploadResult.get("public_id"))
                .secureUrl((String) uploadResult.get("secure_url"))
                .url((String) uploadResult.get("url"))
                .resourceType((String) uploadResult.get("resource_type"))
                .format((String) uploadResult.get("format"))
                .width(getIntegerValue(uploadResult.get("width")))
                .height(getIntegerValue(uploadResult.get("height")))
                .bytes(getIntegerValue(uploadResult.get("bytes")))
                .originalFilename(file.getOriginalFilename())
                .folder((String) uploadResult.get("folder"))
                .build();
    }

    @Override
    public String deleteFile(String publicIdOrUrl) throws IOException {
        String publicId = extractPublicId(publicIdOrUrl);
        Map<?,?> deleteResult = cloudinary
                .uploader()
                .destroy(publicId,ObjectUtils.emptyMap());
        String  result = (String) deleteResult.get("result");
        if ("ok".equals(result)){
            return "File deleted successfully: "+ publicId;
        }else{
            return "Failed to delete file: "+ publicId;
        }
    }

    @Override
    public String getFileUrl(String publicId) {
        return cloudinary.url().generate(publicId);
    }

    @Override
    public Map<String, Object> getFileDetails(String publicId) throws IOException,Exception {
        Map<?, ?> result = cloudinary.api().resource(publicId, ObjectUtils.emptyMap());

        // Convert to typed map
        Map<String, Object> details = new HashMap<>();
        result.forEach((key, value) -> details.put(key.toString(), value));

        return details;
    }

    @Override
    public boolean isImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            return false;
        }

        String extension = getFileExtension(fileName).toLowerCase();
        return ALLOWED_IMAGE_EXTENSION.contains(extension);
    }

    @Override
    public boolean isVideoFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName == null) return false;

        String extension = getFileExtension(fileName).toLowerCase();
        return ALLOWED_VIDEO_EXTENSIONS.contains(extension);
    }

    @Override
    public boolean isDocumentFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName == null) return false;

        String extension = getFileExtension(fileName).toLowerCase();
        return ALLOWED_DOCUMENT_EXTENSIONS.contains(extension);
    }

    @Override
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ImageInvalidException("File is required.");
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new ImageInvalidException("File name is invalid.");
        }

        String extension = getFileExtension(fileName).toLowerCase();
        long fileSize = file.getSize();

        // Check file type and size based on category
        if (ALLOWED_IMAGE_EXTENSION.contains(extension)) {
            if (fileSize > MAX_IMAGE_SIZE) {
                throw new ImageInvalidException(
                        String.format("Image size exceeds %dMB. Max allowed: %dMB",
                                fileSize / (1024 * 1024), MAX_IMAGE_SIZE / (1024 * 1024))
                );
            }
        } else if (ALLOWED_VIDEO_EXTENSIONS.contains(extension)) {
            if (fileSize > MAX_VIDEO_SIZE) {
                throw new ImageInvalidException(
                        String.format("Video size exceeds %dMB. Max allowed: %dMB",
                                fileSize / (1024 * 1024), MAX_VIDEO_SIZE / (1024 * 1024))
                );
            }
        } else if (ALLOWED_DOCUMENT_EXTENSIONS.contains(extension)) {
            if (fileSize > MAX_DOCUMENT_SIZE) {
                throw new ImageInvalidException(
                        String.format("Document size exceeds %dMB. Max allowed: %dMB",
                                fileSize / (1024 * 1024), MAX_DOCUMENT_SIZE / (1024 * 1024))
                );
            }
        } else {
            throw new ImageInvalidException(
                    String.format("File type '%s' is not allowed. Allowed types: Images(%s), Videos(%s), Documents(%s)",
                            extension,
                            String.join(", ", ALLOWED_IMAGE_EXTENSION),
                            String.join(", ", ALLOWED_VIDEO_EXTENSIONS),
                            String.join(", ", ALLOWED_DOCUMENT_EXTENSIONS))
            );
        }
    }

    //helper method
    private String generatePublicId(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return "file_" + System.currentTimeMillis();
        }

        // Remove extension and sanitize
        String nameWithoutExtension = originalFilename.replaceFirst("[.][^.]+$", "");
        return nameWithoutExtension
                .toLowerCase()
                .replaceAll("[^a-z0-9-_]", "_")
                + "_" + System.currentTimeMillis();
    }

    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < fileName.length() - 1) {
            return fileName.substring(lastDotIndex + 1);
        }
        return "";
    }

    private String extractPublicId(String publicIdOrUrl) {
        // If it's already a public ID (no URL format), return as is
        if (!publicIdOrUrl.contains("cloudinary.com")) {
            return publicIdOrUrl;
        }

        // Extract public ID from URL
        // Example: https://res.cloudinary.com/demo/image/upload/v1234567/folder/filename.jpg
        try {
            String[] parts = publicIdOrUrl.split("/upload/");
            if (parts.length > 1) {
                String afterUpload = parts[1];
                // Remove version prefix if exists
                if (afterUpload.startsWith("v")) {
                    afterUpload = afterUpload.substring(afterUpload.indexOf('/') + 1);
                }
                // Remove file extension
                int lastDotIndex = afterUpload.lastIndexOf('.');
                if (lastDotIndex > 0) {
                    afterUpload = afterUpload.substring(0, lastDotIndex);
                }
                return afterUpload;
            }
        } catch (Exception e) {
            // If extraction fails, try to get from the end of URL
        }

        // Fallback: Use the last part of the URL
        String[] urlParts = publicIdOrUrl.split("/");
        String lastPart = urlParts[urlParts.length - 1];
        return lastPart.replaceFirst("[.][^.]+$", "");
    }


    private Integer getIntegerValue(Object obj) {
        if (obj instanceof Integer) {
            return (Integer) obj;
        } else if (obj instanceof Long) {
            return ((Long) obj).intValue();
        } else if (obj instanceof String) {
            try {
                return Integer.parseInt((String) obj);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private Long getLongValue(Object obj) {
        if (obj instanceof Long) {
            return (Long) obj;
        } else if (obj instanceof Integer) {
            return ((Integer) obj).longValue();
        } else if (obj instanceof String) {
            try {
                return Long.parseLong((String) obj);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
