package com.example.library.dto;

import java.time.LocalDateTime;

public class BorrowRecordDTO {
    private Long id;
    private Long bookId;
    private Long userId;
    private String username;
    private String title;
    private String author;
    private LocalDateTime requestedAt;
    private LocalDateTime borrowedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime dueAt;
    private LocalDateTime returnedAt;
    private String status;

    public BorrowRecordDTO(Long id, Long bookId, String title, String author, LocalDateTime borrowedAt,
                           LocalDateTime dueAt, LocalDateTime returnedAt, String status) {
        this(id, bookId, null, null, title, author, borrowedAt, borrowedAt, null, dueAt, returnedAt, status);
    }

    public BorrowRecordDTO(Long id, Long bookId, Long userId, String username, String title, String author,
                           LocalDateTime requestedAt, LocalDateTime borrowedAt, LocalDateTime reviewedAt,
                           LocalDateTime dueAt, LocalDateTime returnedAt, String status) {
        this.id = id;
        this.bookId = bookId;
        this.userId = userId;
        this.username = username;
        this.title = title;
        this.author = author;
        this.requestedAt = requestedAt;
        this.borrowedAt = borrowedAt;
        this.reviewedAt = reviewedAt;
        this.dueAt = dueAt;
        this.returnedAt = returnedAt;
        this.status = status;
    }

    public Long getId() { return id; }
    public Long getBookId() { return bookId; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public LocalDateTime getBorrowedAt() { return borrowedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public LocalDateTime getDueAt() { return dueAt; }
    public LocalDateTime getReturnedAt() { return returnedAt; }
    public String getStatus() { return status; }
}
