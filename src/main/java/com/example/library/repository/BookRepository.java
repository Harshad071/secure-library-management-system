package com.example.library.repository;

import com.example.library.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {
    @Query(value = "select * from books b where " +
            "lower(coalesce(b.title, '')) like :pattern escape '\\' or " +
            "lower(coalesce(b.author, '')) like :pattern escape '\\' or " +
            "lower(coalesce(b.category, '')) like :pattern escape '\\' or " +
            "lower(coalesce(b.isbn, '')) like :pattern escape '\\' " +
            "order by b.title asc",
            nativeQuery = true)
    List<Book> search(@Param("pattern") String pattern);

    @Query("select coalesce(sum(b.availableCopies), 0) from Book b")
    long sumAvailableCopies();

    @Query("select coalesce(sum(b.totalCopies - b.availableCopies), 0) from Book b")
    long sumBorrowedCopies();

    long countByAvailableCopiesGreaterThanAndAvailableCopiesLessThanEqual(int minExclusive, int maxInclusive);

    List<Book> findTop5ByOrderByCreatedAtDesc();

    boolean existsByIsbn(String isbn);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Book b where b.id = ?1")
    Optional<Book> findLockedById(Long id);
}
