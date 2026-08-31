package com.example.library;

import com.example.library.dto.BookResponse;
import com.example.library.service.BookService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class LibraryApplicationTests {

	@Autowired
	private BookService bookService;

	@Test
	void contextLoads() {
	}

	@Test
	void bookSearchReturnsCleanTitles() {
		List<BookResponse> books = bookService.findAll("Clean");

		assertThat(books)
				.extracting(BookResponse::getTitle)
				.contains("Clean Code", "Clean Architecture");
	}

	@Test
	void bookSearchHandlesSpecialCharactersSafely() {
		List<BookResponse> books = bookService.findAll("Clean%");

		assertThat(books).isEmpty();
	}

}
