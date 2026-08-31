package com.example.library.dto;

import java.util.Collections;
import java.util.List;

public class DashboardStats {
    private long totalBooks;
    private long totalUsers;
    private long totalBorrows;
    private long availableBooks;
    private long borrowedBooks;
    private long activeBorrows;
    private long pendingRequests;
    private long overdueBooks;
    private long dueSoonBooks;
    private long lowStockBooks;
    private List<ActivityDTO> recentActivity;

    public DashboardStats(long totalBooks, long totalUsers, long totalBorrows) {
        this(totalBooks, totalUsers, totalBorrows, 0, 0, totalBorrows, 0, 0, 0, 0, Collections.emptyList());
    }

    public DashboardStats(long totalBooks, long totalUsers, long totalBorrows, long availableBooks,
                          long borrowedBooks, long activeBorrows, long overdueBooks, long lowStockBooks,
                          List<ActivityDTO> recentActivity) {
        this(totalBooks, totalUsers, totalBorrows, availableBooks, borrowedBooks, activeBorrows, 0,
                overdueBooks, 0, lowStockBooks, recentActivity);
    }

    public DashboardStats(long totalBooks, long totalUsers, long totalBorrows, long availableBooks,
                          long borrowedBooks, long activeBorrows, long pendingRequests, long overdueBooks,
                          long dueSoonBooks, long lowStockBooks, List<ActivityDTO> recentActivity) {
        this.totalBooks = totalBooks;
        this.totalUsers = totalUsers;
        this.totalBorrows = totalBorrows;
        this.availableBooks = availableBooks;
        this.borrowedBooks = borrowedBooks;
        this.activeBorrows = activeBorrows;
        this.pendingRequests = pendingRequests;
        this.overdueBooks = overdueBooks;
        this.dueSoonBooks = dueSoonBooks;
        this.lowStockBooks = lowStockBooks;
        this.recentActivity = recentActivity;
    }

    public long getTotalBooks() { return totalBooks; }
    public long getTotalUsers() { return totalUsers; }
    public long getTotalBorrows() { return totalBorrows; }
    public long getAvailableBooks() { return availableBooks; }
    public long getBorrowedBooks() { return borrowedBooks; }
    public long getActiveBorrows() { return activeBorrows; }
    public long getPendingRequests() { return pendingRequests; }
    public long getOverdueBooks() { return overdueBooks; }
    public long getDueSoonBooks() { return dueSoonBooks; }
    public long getLowStockBooks() { return lowStockBooks; }
    public List<ActivityDTO> getRecentActivity() { return recentActivity; }
}
