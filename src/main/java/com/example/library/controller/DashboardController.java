package com.example.library.controller;

import com.example.library.dto.ActivityDTO;
// Day 2: dashboard metrics for borrow health, availability, and recent activity
import com.example.library.dto.DashboardStats;import com.example.library.service.AdminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final AdminService adminService;

    public DashboardController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public DashboardStats stats() {
        return adminService.stats();
    }

    @GetMapping("/activity")
    public List<ActivityDTO> activity() {
        return adminService.recentActivity();
    }
}
