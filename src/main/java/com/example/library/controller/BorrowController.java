package com.example.library.controller;

import com.example.library.dto.BorrowRecordDTO;
import com.example.library.security.CustomUserDetails;
import com.example.library.service.BorrowService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrows")
public class BorrowController {
    private final BorrowService borrowService;

    public BorrowController(BorrowService borrowService) {
        this.borrowService = borrowService;
    }

    @GetMapping("/my")
    public List<BorrowRecordDTO> myBorrows(@AuthenticationPrincipal CustomUserDetails user) {
        return borrowService.myBorrows(user.getId());
    }

    @PostMapping("/{bookId}")
    public BorrowRecordDTO borrow(@PathVariable Long bookId, @AuthenticationPrincipal CustomUserDetails user) {
        return borrowService.borrow(bookId, user.getId());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<BorrowRecordDTO> pendingRequests() {
        return borrowService.pendingRequests();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<BorrowRecordDTO> allRequests() {
        return borrowService.allRequests();
    }

    @PostMapping("/{borrowId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public BorrowRecordDTO approve(@PathVariable Long borrowId) {
        return borrowService.approve(borrowId);
    }

    @PostMapping("/{borrowId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public BorrowRecordDTO reject(@PathVariable Long borrowId) {
        return borrowService.reject(borrowId);
    }

    @PostMapping("/{borrowId}/return")
    public BorrowRecordDTO returnBook(@PathVariable Long borrowId, @AuthenticationPrincipal CustomUserDetails user) {
        return borrowService.returnBook(borrowId, user.getId());
    }
}
