package com.example.library.service;

import com.example.library.dto.ActivityDTO;
import com.example.library.dto.AdminUserDTO;
import com.example.library.dto.DashboardStats;
import com.example.library.entity.Book;
import com.example.library.entity.BorrowRecord;
import com.example.library.entity.Role;
import com.example.library.entity.User;
import com.example.library.repository.BookRepository;
import com.example.library.repository.BorrowRecordRepository;
import com.example.library.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private static final List<String> ACTIVE_STATUSES = Arrays.asList("APPROVED", "BORROWED");

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public AdminService(BookRepository bookRepository, UserRepository userRepository,
                        BorrowRecordRepository borrowRecordRepository) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStats stats() {
        long activeBorrows = borrowRecordRepository.countByStatus("BORROWED");
        activeBorrows += borrowRecordRepository.countByStatus("APPROVED");
        LocalDateTime now = LocalDateTime.now();
        long overdueBooks = borrowRecordRepository.countByStatusInAndDueAtBefore(ACTIVE_STATUSES, now);
        long dueSoonBooks = borrowRecordRepository.countByStatusInAndDueAtBetween(ACTIVE_STATUSES, now, now.plusDays(3));
        return new DashboardStats(
                bookRepository.count(),
                userRepository.count(),
                borrowRecordRepository.count(),
                bookRepository.sumAvailableCopies(),
                bookRepository.sumBorrowedCopies(),
                activeBorrows,
                borrowRecordRepository.countByStatus("PENDING"),
                overdueBooks,
                dueSoonBooks,
                bookRepository.countByAvailableCopiesGreaterThanAndAvailableCopiesLessThanEqual(0, 2),
                recentActivity()
        );
    }

    @Transactional(readOnly = true)
    public List<ActivityDTO> recentActivity() {
        List<ActivityDTO> activity = new ArrayList<>();

        for (BorrowRecord record : borrowRecordRepository.findAllWithUserAndBookOrderByBorrowedAtDesc()) {
            if ("PENDING".equals(record.getStatus())) {
                activity.add(new ActivityDTO("REQUEST",
                        record.getUser().getUsername() + " requested " + record.getBook().getTitle(),
                        record.getRequestedAt() != null ? record.getRequestedAt() : record.getBorrowedAt()));
            } else if ("APPROVED".equals(record.getStatus()) || "BORROWED".equals(record.getStatus())) {
                activity.add(new ActivityDTO("APPROVED",
                        record.getUser().getUsername() + " was approved for " + record.getBook().getTitle(),
                        record.getReviewedAt() != null ? record.getReviewedAt() : record.getBorrowedAt()));
                if (record.getDueAt() != null && record.getDueAt().isBefore(LocalDateTime.now())) {
                    activity.add(new ActivityDTO("OVERDUE",
                            "Overdue warning: " + record.getBook().getTitle() + " is due from " + record.getUser().getUsername(),
                            record.getDueAt()));
                }
            } else if ("REJECTED".equals(record.getStatus())) {
                activity.add(new ActivityDTO("REJECTED",
                        record.getUser().getUsername() + " was rejected for " + record.getBook().getTitle(),
                        record.getReviewedAt() != null ? record.getReviewedAt() : record.getBorrowedAt()));
            } else if ("RETURNED".equals(record.getStatus())) {
                activity.add(new ActivityDTO("RETURN",
                        record.getUser().getUsername() + " returned " + record.getBook().getTitle(),
                        record.getReturnedAt()));
            }
        }

        for (Book book : bookRepository.findTop5ByOrderByCreatedAtDesc()) {
            if (book.getCreatedAt() != null) {
                activity.add(new ActivityDTO("BOOK",
                        "Book catalogued: " + book.getTitle(),
                        book.getCreatedAt()));
            }
        }

        for (Book book : bookRepository.findAll()) {
            if (book.getUpdatedAt() != null && book.getCreatedAt() != null
                    && book.getUpdatedAt().isAfter(book.getCreatedAt().plusSeconds(1))) {
                activity.add(new ActivityDTO("STOCK",
                        "Stock updated for " + book.getTitle() + ": " + book.getAvailableCopies()
                                + " of " + book.getTotalCopies() + " available",
                        book.getUpdatedAt()));
            }
        }

        for (User user : userRepository.findTop5ByOrderByCreatedAtDesc()) {
            if (user.getCreatedAt() != null) {
                activity.add(new ActivityDTO("USER",
                        "User registered: " + user.getUsername(),
                        user.getCreatedAt()));
            }
        }

        return activity.stream()
                .sorted(Comparator.comparing(ActivityDTO::getOccurredAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(8)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminUserDTO> users() {
        return userRepository.findAll().stream()
                .map(this::toAdminUser)
                .collect(Collectors.toList());
    }

    private AdminUserDTO toAdminUser(User user) {
        String role = user.getRoles().stream()
                .map(Role::getName)
                .sorted()
                .findFirst()
                .orElse("USER");
        String name = user.getFullName() == null || user.getFullName().trim().isEmpty()
                ? user.getUsername()
                : user.getFullName();
        return new AdminUserDTO(user.getId(), name, user.getEmail(), role,
                borrowRecordRepository.countByUserAndStatusIn(user, ACTIVE_STATUSES));
    }
}
