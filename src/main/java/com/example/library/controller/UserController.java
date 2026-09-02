package com.example.library.controller;

// Day 2: identity endpoint exposing the current authenticated user profile
import com.example.library.dto.UserResponse;
import com.example.library.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal CustomUserDetails principal) {
        String role = principal.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")) ? "ADMIN" : "USER";
        return new UserResponse(principal.getId(), principal.getUsername(), principal.getEmail(), principal.getFullName(), role);
    }
}
