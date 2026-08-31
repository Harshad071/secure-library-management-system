package com.example.library.service;

import com.example.library.dto.BorrowRecordDTO;
import com.example.library.entity.Book;
import com.example.library.entity.BorrowRecord;
import com.example.library.entity.User;
import com.example.library.repository.BookRepository;
import com.example.library.repository.BorrowRecordRepository;
import com.example.library.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BorrowService {
    private static final String PENDING = "PENDING";
    private static final String APPROVED = "APPROVED";
    private static final String REJECTED = "REJECTED";
    private static final String BORROWED = "BORROWED";
    private static final String RETURNED = "RETURNED";

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public BorrowService(BorrowRecordRepository borrowRecordRepository, BookRepository bookRepository,
                         UserRepository userRepository) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordDTO> myBorrows(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return borrowRecordRepository.findByUserOrderByBorrowedAtDesc(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BorrowRecordDTO borrow(Long bookId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Book book = bookRepository.findLockedById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new IllegalArgumentException("Book currently out of stock");
        }

        if (borrowRecordRepository.existsByUserAndBookAndStatusIn(user, book,
                java.util.Arrays.asList(PENDING, APPROVED, BORROWED))) {
            throw new IllegalArgumentException("You already have an active request for this book");
        }

        BorrowRecord record = new BorrowRecord();
        record.setUser(user);
        record.setBook(book);
        LocalDateTime now = LocalDateTime.now();
        record.setRequestedAt(now);
        record.setBorrowedAt(now);
        record.setStatus(PENDING);

        return toDto(borrowRecordRepository.save(record));
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordDTO> pendingRequests() {
        return borrowRecordRepository.findByStatusOrderByBorrowedAtDesc(PENDING).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordDTO> allRequests() {
        return borrowRecordRepository.findAllWithUserAndBookOrderByBorrowedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BorrowRecordDTO approve(Long borrowId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new IllegalArgumentException("Borrow request not found"));

        if (!PENDING.equals(record.getStatus())) {
            throw new IllegalArgumentException("Only pending requests can be approved");
        }

        Book book = bookRepository.findLockedById(record.getBook().getId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new IllegalArgumentException("Book currently out of stock");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        LocalDateTime now = LocalDateTime.now();
        record.setReviewedAt(now);
        record.setBorrowedAt(now);
        record.setDueAt(now.plusDays(14));
        record.setStatus(APPROVED);

        bookRepository.save(book);
        return toDto(borrowRecordRepository.save(record));
    }

    @Transactional
    public BorrowRecordDTO reject(Long borrowId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new IllegalArgumentException("Borrow request not found"));

        if (!PENDING.equals(record.getStatus())) {
            throw new IllegalArgumentException("Only pending requests can be rejected");
        }

        record.setReviewedAt(LocalDateTime.now());
        record.setStatus(REJECTED);
        return toDto(borrowRecordRepository.save(record));
    }

    @Transactional
    public BorrowRecordDTO returnBook(Long borrowId, Long userId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new IllegalArgumentException("Borrow record not found"));

        if (!record.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only return your own borrowed books");
        }

        if (!APPROVED.equals(record.getStatus()) && !BORROWED.equals(record.getStatus())) {
            throw new IllegalArgumentException("Only approved borrowed books can be returned");
        }

        Book book = record.getBook();
        book.setAvailableCopies(Math.min(book.getAvailableCopies() + 1, book.getTotalCopies()));
        record.setReturnedAt(LocalDateTime.now());
        record.setStatus(RETURNED);

        bookRepository.save(book);
        return toDto(borrowRecordRepository.save(record));
    }

    private BorrowRecordDTO toDto(BorrowRecord record) {
        String status = (APPROVED.equals(record.getStatus()) || BORROWED.equals(record.getStatus())) && record.getDueAt() != null
                && record.getDueAt().isBefore(LocalDateTime.now()) ? "Overdue" : toDisplayStatus(record.getStatus());
        return new BorrowRecordDTO(record.getId(), record.getBook().getId(), record.getUser().getId(),
                record.getUser().getUsername(), record.getBook().getTitle(), record.getBook().getAuthor(),
                record.getRequestedAt(), record.getBorrowedAt(), record.getReviewedAt(), record.getDueAt(),
                record.getReturnedAt(), status);
    }

    private String toDisplayStatus(String status) {
        if (PENDING.equals(status)) {
            return "Pending";
        }
        if (APPROVED.equals(status) || BORROWED.equals(status)) {
            return "Approved";
        }
        if (REJECTED.equals(status)) {
            return "Rejected";
        }
        if (RETURNED.equals(status)) {
            return "Returned";
        }
        return status;
    }
}
