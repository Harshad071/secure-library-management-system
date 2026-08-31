package com.example.library.service;

import com.example.library.dto.BookRequest;
import com.example.library.dto.BookResponse;
import com.example.library.entity.Book;
import com.example.library.repository.BookRepository;
import com.example.library.repository.BorrowRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public BookService(BookRepository bookRepository, BorrowRecordRepository borrowRecordRepository) {
        this.bookRepository = bookRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    @Transactional(readOnly = true)
    public List<BookResponse> findAll(String q) {
        String query = q == null ? "" : q.trim();
        List<Book> books = query.isEmpty()
                ? bookRepository.findAll()
                : bookRepository.search(toSearchPattern(query));
        return books.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private String toSearchPattern(String query) {
        return "%" + query.toLowerCase()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_") + "%";
    }

    @Transactional
    public BookResponse create(BookRequest request) {
        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setCategory(request.getCategory());
        book.setIsbn(request.getIsbn());
        int totalCopies = request.getTotalCopies() == null ? 1 : request.getTotalCopies();
        book.setTotalCopies(totalCopies);
        book.setAvailableCopies(request.getAvailableCopies() == null
                ? totalCopies
                : Math.min(request.getAvailableCopies(), totalCopies));
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public BookResponse update(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setCategory(request.getCategory());
        book.setIsbn(request.getIsbn());

        int borrowedCopies = Math.max(book.getTotalCopies() - book.getAvailableCopies(), 0);
        if (request.getTotalCopies() != null) {
            if (request.getTotalCopies() < borrowedCopies) {
                throw new IllegalArgumentException("Total copies cannot be less than currently approved borrows");
            }
            book.setTotalCopies(request.getTotalCopies());
            book.setAvailableCopies(Math.min(book.getAvailableCopies(), request.getTotalCopies() - borrowedCopies));
        }

        if (request.getAvailableCopies() != null) {
            book.setAvailableCopies(Math.min(request.getAvailableCopies(), book.getTotalCopies() - borrowedCopies));
        }

        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public void delete(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (borrowRecordRepository.existsByBook(book)) {
            throw new IllegalArgumentException("Cannot delete a book with borrow request history");
        }
        bookRepository.delete(book);
    }

    public BookResponse toResponse(Book book) {
        return new BookResponse(book.getId(), book.getTitle(), book.getAuthor(), book.getCategory(),
                book.getIsbn(), book.getTotalCopies(), book.getAvailableCopies());
    }
}
