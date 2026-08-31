package com.example.library.config;

import com.example.library.entity.Book;
import com.example.library.entity.Role;
import com.example.library.entity.User;
import com.example.library.repository.BookRepository;
import com.example.library.repository.RoleRepository;
import com.example.library.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedData(RoleRepository roleRepository, UserRepository userRepository,
                               BookRepository bookRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            Role userRole = roleRepository.findByName("USER").orElseGet(() -> roleRepository.save(new Role("USER")));
            Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> roleRepository.save(new Role("ADMIN")));

            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@securelibrary.dev");
                admin.setFullName("System Admin");
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setRoles(Collections.singleton(adminRole));
                userRepository.save(admin);
            }

            if (!userRepository.existsByUsername("user")) {
                User user = new User();
                user.setUsername("user");
                user.setEmail("user@securelibrary.dev");
                user.setFullName("Library User");
                user.setPassword(passwordEncoder.encode("User@123"));
                user.setRoles(Collections.singleton(userRole));
                userRepository.save(user);
            }

            for (SeedBook seedBook : seedBooks()) {
                if (!bookRepository.existsByIsbn(seedBook.isbn)) {
                    Book book = new Book();
                    book.setTitle(seedBook.title);
                    book.setAuthor(seedBook.author);
                    book.setCategory(seedBook.category);
                    book.setIsbn(seedBook.isbn);
                    book.setTotalCopies(seedBook.totalCopies);
                    book.setAvailableCopies(seedBook.availableCopies);
                    bookRepository.save(book);
                }
            }
        };
    }

    private List<SeedBook> seedBooks() {
        return Arrays.asList(
                new SeedBook("Clean Code", "Robert C. Martin", "Software Engineering", "9780132350884", 8, 8),
                new SeedBook("Clean Architecture", "Robert C. Martin", "Software Engineering", "9780134494166", 6, 6),
                new SeedBook("Spring in Action", "Craig Walls", "Backend Development", "9781617297571", 7, 7),
                new SeedBook("Effective Java", "Joshua Bloch", "Java", "9780134685991", 5, 5),
                new SeedBook("Java: The Complete Reference", "Herbert Schildt", "Java", "9781260440232", 4, 4),
                new SeedBook("Head First Java", "Kathy Sierra and Bert Bates", "Java", "9781491910771", 6, 6),
                new SeedBook("Database System Concepts", "Abraham Silberschatz", "Database", "9780078022159", 5, 5),
                new SeedBook("Designing Data-Intensive Applications", "Martin Kleppmann", "Database", "9781449373320", 4, 4),
                new SeedBook("SQL Performance Explained", "Markus Winand", "Database", "9783950307825", 3, 3),
                new SeedBook("Computer Networks", "Andrew S. Tanenbaum", "Networking", "9780132126953", 5, 5),
                new SeedBook("TCP/IP Illustrated", "W. Richard Stevens", "Networking", "9780321336316", 3, 3),
                new SeedBook("Network Security Essentials", "William Stallings", "Cybersecurity", "SEC-001", 5, 5),
                new SeedBook("Modern Cryptography", "Jonathan Katz and Yehuda Lindell", "Cybersecurity", "9780815354369", 4, 4),
                new SeedBook("Cryptography and Network Security", "William Stallings", "Cybersecurity", "9780134444284", 5, 5),
                new SeedBook("Web Application Security", "Andrew Hoffman", "Cybersecurity", "9781492053118", 4, 4),
                new SeedBook("The Web Application Hacker's Handbook", "Dafydd Stuttard and Marcus Pinto", "Cybersecurity", "9781118026472", 2, 2),
                new SeedBook("Hacking: The Art of Exploitation", "Jon Erickson", "Cybersecurity", "9781593271442", 3, 3),
                new SeedBook("Operating System Concepts", "Abraham Silberschatz", "Operating Systems", "9781119800361", 6, 6),
                new SeedBook("Modern Operating Systems", "Andrew S. Tanenbaum", "Operating Systems", "9780133591620", 4, 4),
                new SeedBook("Computer Organization and Design", "David A. Patterson and John L. Hennessy", "Computer Architecture", "9780128201091", 4, 4),
                new SeedBook("Introduction to Algorithms", "Thomas H. Cormen", "Algorithms", "9780262046305", 5, 5),
                new SeedBook("The Algorithm Design Manual", "Steven S. Skiena", "Algorithms", "9783030542559", 4, 4),
                new SeedBook("Artificial Intelligence: A Modern Approach", "Stuart Russell and Peter Norvig", "Artificial Intelligence", "9780134610993", 3, 3),
                new SeedBook("Hands-On Machine Learning", "Aurelien Geron", "Artificial Intelligence", "9781098125974", 4, 4),
                new SeedBook("Deep Learning", "Ian Goodfellow, Yoshua Bengio, and Aaron Courville", "Artificial Intelligence", "9780262035613", 2, 2),
                new SeedBook("Refactoring", "Martin Fowler", "Software Engineering", "9780134757599", 5, 5),
                new SeedBook("Patterns of Enterprise Application Architecture", "Martin Fowler", "Software Engineering", "9780321127426", 3, 3),
                new SeedBook("Domain-Driven Design", "Eric Evans", "Software Engineering", "9780321125217", 3, 3),
                new SeedBook("Microservices Patterns", "Chris Richardson", "Backend Development", "9781617294549", 4, 4),
                new SeedBook("Building Microservices", "Sam Newman", "Backend Development", "9781492034025", 4, 4),
                new SeedBook("Docker Deep Dive", "Nigel Poulton", "DevOps", "9781916585250", 5, 5),
                new SeedBook("Kubernetes in Action", "Marko Luksa", "DevOps", "9781617293726", 3, 3),
                new SeedBook("Site Reliability Engineering", "Betsy Beyer, Chris Jones, Jennifer Petoff, and Niall Murphy", "DevOps", "9781491929124", 3, 3),
                new SeedBook("The Pragmatic Programmer", "David Thomas and Andrew Hunt", "Software Engineering", "9780135957059", 7, 7),
                new SeedBook("Code Complete", "Steve McConnell", "Software Engineering", "9780735619678", 4, 4)
        );
    }

    private static class SeedBook {
        private final String title;
        private final String author;
        private final String category;
        private final String isbn;
        private final int totalCopies;
        private final int availableCopies;

        private SeedBook(String title, String author, String category, String isbn, int totalCopies, int availableCopies) {
            this.title = title;
            this.author = author;
            this.category = category;
            this.isbn = isbn;
            this.totalCopies = totalCopies;
            this.availableCopies = availableCopies;
        }
    }
}
