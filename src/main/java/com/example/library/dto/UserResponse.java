package com.example.library.dto;

public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;

    public UserResponse(Long id, String username, String email, String fullName, String role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }
}
