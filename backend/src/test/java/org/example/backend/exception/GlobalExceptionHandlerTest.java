package org.example.backend.exception;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders
                .standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(
                        Jackson2ObjectMapperBuilder.json().build()
                ))
                .setValidator(validator)
                .build();
    }

    @Test
    void returnsNotFoundForUserNotFoundException() throws Exception {
        mockMvc.perform(get("/test/user-not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("User not found"))
                .andExpect(jsonPath("$.path").value("/test/user-not-found"));
    }

    @Test
    void returnsUnauthorizedForInvalidCredentialsException() throws Exception {
        mockMvc.perform(get("/test/invalid-credentials"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid username or password"))
                .andExpect(jsonPath("$.path").value("/test/invalid-credentials"));
    }

    @Test
    void returnsForbiddenForPerkRequirementNotMetException() throws Exception {
        mockMvc.perform(get("/test/perk-requirement"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value("You need level 5 to unlock this perk"))
                .andExpect(jsonPath("$.path").value("/test/perk-requirement"));
    }

    @Test
    void returnsConflictForDuplicateResourceException() throws Exception {
        mockMvc.perform(get("/test/duplicate"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Username already taken"))
                .andExpect(jsonPath("$.path").value("/test/duplicate"));
    }

    @Test
    void returnsBadRequestForValidationFailure() throws Exception {
        mockMvc.perform(post("/test/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":""}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.path").value("/test/validate"))
                .andExpect(jsonPath("$.fieldErrors.name").value("Name is required"));
    }

    @RestController
    static class TestController {

        @GetMapping("/test/user-not-found")
        void userNotFound() {
            throw new UserNotFoundException("User not found");
        }

        @GetMapping("/test/invalid-credentials")
        void invalidCredentials() {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        @GetMapping("/test/perk-requirement")
        void perkRequirement() {
            throw new PerkRequirementNotMetException("You need level 5 to unlock this perk");
        }

        @GetMapping("/test/duplicate")
        void duplicate() {
            throw new DuplicateResourceException("Username already taken");
        }

        @PostMapping("/test/validate")
        void validate(@Valid @RequestBody ValidatedRequest request) {
        }
    }

    record ValidatedRequest(
            @NotBlank(message = "Name is required")
            String name
    ) {
    }
}
