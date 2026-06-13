package com.varun.tts.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.varun.tts.dto.ErrorResponseDTO;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1️⃣ Handle Resource Not Found
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponseDTO handleResourceNotFound(ResourceNotFoundException ex) {

        return new ErrorResponseDTO(
                404,
                "NOT_FOUND",
                ex.getMessage()
        );
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponseDTO handleValidationError(MethodArgumentNotValidException ex) {

        String errorMessage = ex
                .getBindingResult()
                .getFieldErrors()
                .get(0)
                .getDefaultMessage();

        return new ErrorResponseDTO(
                400,
                "VALIDATION_ERROR",
                errorMessage
        );
    }


    // 3️⃣ Handle All Other Exceptions
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponseDTO handleGenericException(Exception ex) {

        // Log full exception for debugging
        ex.printStackTrace();

        return new ErrorResponseDTO(
                500,
                "INTERNAL_ERROR",
                "An unexpected error occurred"
        );
    }

}