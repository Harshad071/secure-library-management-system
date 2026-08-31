package com.example.library.dto;

public class AdminUserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private long activeBorrows;

    public AdminUserDTO(Long id, String name, String email, String role, long activeBorrows) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.activeBorrows = activeBorrows;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public long getActiveBorrows() { return activeBorrows; }
}
