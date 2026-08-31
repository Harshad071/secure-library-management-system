package com.example.library.dto;

public class BookResponse {
    private Long id;
    private String title;
    private String author;
    private String category;
    private String isbn;
    private int totalCopies;
    private int availableCopies;
    private String status;

    public BookResponse(Long id, String title, String author, String category, String isbn, int totalCopies, int availableCopies) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.category = category;
        this.isbn = isbn;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.status = availableCopies > 0 ? "Available" : "Unavailable";
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getCategory() { return category; }
    public String getIsbn() { return isbn; }
    public int getTotalCopies() { return totalCopies; }
    public int getAvailableCopies() { return availableCopies; }
    public String getStatus() { return status; }
}
