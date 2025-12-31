package com.blogrestapi.Exception;

public class ImageInvalidException extends RuntimeException{
    public ImageInvalidException(String message){
        super(message);
    }
}
