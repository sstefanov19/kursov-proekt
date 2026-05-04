package org.example.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.backend.exception.ApiErrorResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(-101) // runs before Spring Security's filter chain (default order -100)
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiterRegistry rateLimiterRegistry;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/v1/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String ip = resolveClientIp(request);
        String path = request.getRequestURI();
        String configName = path.endsWith("/login") ? "auth-login" : "auth-register";

        RateLimiter limiter = rateLimiterRegistry.rateLimiter(ip + ":" + path, configName);

        if (limiter.acquirePermission()) {
            chain.doFilter(request, response);
        } else {
            writeTooManyRequests(response, path);
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void writeTooManyRequests(HttpServletResponse response, String path) throws IOException {
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", "60");
        objectMapper.writeValue(response.getWriter(), ApiErrorResponse.of(
                "RATE_LIMIT_EXCEEDED", 429, "Too Many Requests",
                "Too many requests. Please try again later.", path
        ));
    }
}
