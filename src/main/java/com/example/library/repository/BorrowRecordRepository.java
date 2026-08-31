package com.example.library.repository;

import com.example.library.entity.BorrowRecord;
import com.example.library.entity.Book;
import com.example.library.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    @EntityGraph(attributePaths = {"book"})
    List<BorrowRecord> findByUserOrderByBorrowedAtDesc(User user);

    @Query("select br from BorrowRecord br join fetch br.user join fetch br.book order by br.borrowedAt desc")
    List<BorrowRecord> findAllWithUserAndBookOrderByBorrowedAtDesc();

    Optional<BorrowRecord> findByUserAndBookAndStatus(User user, Book book, String status);
    boolean existsByUserAndBookAndStatusIn(User user, Book book, Collection<String> statuses);
    boolean existsByBookAndStatusIn(Book book, Collection<String> statuses);
    boolean existsByBook(Book book);
    long countByStatus(String status);
    long countByStatusIn(Collection<String> statuses);
    long countByStatusAndDueAtBefore(String status, LocalDateTime dueAt);
    long countByStatusInAndDueAtBefore(Collection<String> statuses, LocalDateTime dueAt);
    long countByStatusInAndDueAtBetween(Collection<String> statuses, LocalDateTime start, LocalDateTime end);
    long countByUserAndStatus(User user, String status);
    long countByUserAndStatusIn(User user, Collection<String> statuses);

    @EntityGraph(attributePaths = {"user", "book"})
    List<BorrowRecord> findTop10ByOrderByBorrowedAtDesc();

    @EntityGraph(attributePaths = {"user", "book"})
    List<BorrowRecord> findByStatusOrderByBorrowedAtDesc(String status);

    @EntityGraph(attributePaths = {"user", "book"})
    List<BorrowRecord> findByStatusInOrderByBorrowedAtDesc(Collection<String> statuses);
}
