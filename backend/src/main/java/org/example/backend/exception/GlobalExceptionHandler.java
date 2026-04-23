package org.example.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleUserNotFound(
            UserNotFoundException ex,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.NOT_FOUND, ex, request);
    }

    @ExceptionHandler(ClassroomNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleClassroomNotFound(
            ClassroomNotFoundException ex,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.NOT_FOUND, ex, request);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException ex,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex, request);
    }

    @ExceptionHandler(PerkRequirementNotMetException.class)
    public ResponseEntity<ApiErrorResponse> handlePerkRequirementNotMet(
            PerkRequirementNotMetException ex,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.FORBIDDEN, ex, request);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateResource(
            DuplicateResourceException ex,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.CONFLICT, ex, request);
    }

    @ExceptionHandler({InvalidPerkException.class, IllegalArgumentException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiErrorResponse> handleBadRequest(
            RuntimeException ex,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex, request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationFailure(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }

        ApiErrorResponse body = ApiErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Validation failed",
                request.getRequestURI(),
                fieldErrors
        );

        log.warn(
                "Handled API error: status={}, method={}, path={}, message={}, fieldErrors={}",
                HttpStatus.BAD_REQUEST.value(),
                request.getMethod(),
                request.getRequestURI(),
                "Validation failed",
                fieldErrors
        );

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedError(
            Exception ex,
            HttpServletRequest request
    ) {
        String message = "Unexpected server error";
        log.error(
                "Unhandled API error: status={}, method={}, path={}, message={}",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                request.getMethod(),
                request.getRequestURI(),
                message,
                ex
        );
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, message, request.getRequestURI());
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatus status, RuntimeException ex, HttpServletRequest request) {
        String message = ex.getMessage() == null || ex.getMessage().isBlank()
                ? status.getReasonPhrase()
                : ex.getMessage();

        log.warn(
                "Handled API error: status={}, method={}, path={}, message={}",
                status.value(),
                request.getMethod(),
                request.getRequestURI(),
                message
        );

        return buildResponse(status, message, request.getRequestURI());
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatus status, String message, String path) {
        ApiErrorResponse body = ApiErrorResponse.of(
                status.value(),
                status.getReasonPhrase(),
                message,
                path
        );
        return ResponseEntity.status(status).body(body);
    }
}
