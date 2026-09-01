package com.example.library.controller;

// Day 2: admin surface for approvals, users, and inventory health
import com.example.library.dto.AdminUserDTO;
import com.example.library.dto.DashboardStats;
import com.example.library.service.AdminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public DashboardStats stats() {
        return adminService.stats();
    }

    @GetMapping("/users")
    public List<AdminUserDTO> users() {
        return adminService.users();
    }
}
