package org.example.backend.config;

import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;

@Configuration
public class RateLimiterConfiguration {

    @Bean
    public RateLimiterRegistry rateLimiterRegistry() {
        RateLimiterConfig loginConfig = RateLimiterConfig.custom()
                .limitForPeriod(10)
                .limitRefreshPeriod(Duration.ofMinutes(1))
                .timeoutDuration(Duration.ZERO)
                .build();

        RateLimiterConfig registerConfig = RateLimiterConfig.custom()
                .limitForPeriod(5)
                .limitRefreshPeriod(Duration.ofMinutes(1))
                .timeoutDuration(Duration.ZERO)
                .build();

        return RateLimiterRegistry.of(Map.of(
                "auth-login", loginConfig,
                "auth-register", registerConfig
        ));
    }
}
