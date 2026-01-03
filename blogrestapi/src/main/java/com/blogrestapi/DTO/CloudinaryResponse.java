package com.blogrestapi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CloudinaryResponse {
    private String publicId;          // "blog-images/filename_123456789"
    private String secureUrl;         // "https://res.cloudinary.com/..."
    private String url;               // "http://res.cloudinary.com/..."
    private String resourceType;      // "image", "video", "raw"
    private String format;            // "jpg", "png", "mp4", "pdf"
    private Integer bytes;            // File size in bytes
    private Integer width;            // Width in pixels (if image/video)
    private Integer height;           // Height in pixels (if image/video)
    private String folder;            // "blog-images"
    private String originalFilename;  // Original uploaded filename
}