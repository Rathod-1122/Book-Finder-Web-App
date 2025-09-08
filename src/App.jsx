import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  
  const [query, setQuery] = useState('');// State to hold the user search query input

  const [books, setBooks] = useState([]);// State to store the list of books fetched from the API

  const [loading, setLoading] = useState(false);// State to track loading status during API call

  const [error, setError] = useState('');// State to store error messages (if any) during API call

  const [page, setPage] = useState(1);// State to track the current page number for pagination

  const [numFound, setNumFound] = useState(0);// State to store total number of books found (from API result)

  const BOOKS_PER_PAGE = 10;// Constant to define how many books to show per page

  // Function to fetch books from Open Library API based on query and page
  const searchBooks = async (newPage = 1) => {
    if (!query.trim()) return; // Prevent empty searches

    setLoading(true);      // Show loading spinner
    setError('');          // Clear any previous error
    setBooks([]);          // Clear previous book list
    setPage(newPage);      // Set the current page

    try {
      // Make Axios GET request to Open Library API
      const response = await axios.get(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&page=${newPage}`
      );

      const data = response.data;
      setNumFound(data.numFound);  // Store total books found

      if (data.docs.length === 0) {
        setError('No books found. Try a different title.');
      } else {
        setBooks(data.docs.slice(0, BOOKS_PER_PAGE)); // Limit results to 10 books per page
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch books. Please try again.');
    }

    setLoading(false);  // Hide loading spinner
  };

  // Opens the Open Library book page in a new tab when user clicks a book card
  const openBookPage = (key) => {
    const url = `https://openlibrary.org${key}`;
    window.open(url, '_blank');
  };

  // Handles clicking the "Next ▶" pagination button
  const handleNextPage = () => {
    if (page * BOOKS_PER_PAGE < numFound) {
      searchBooks(page + 1);
    }
  };

  // Handles clicking the "◀ Previous" pagination button
  const handlePrevPage = () => {
    if (page > 1) {
      searchBooks(page - 1);
    }
  };

  return (
    <div className="app">
      <h1>📚 Book Finder</h1>

      {/* Search bar: input field + search button */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search books by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchBooks(1)} // Trigger search on Enter key
        />
        <button onClick={() => searchBooks(1)}>Search</button>
      </div>

      {/* Show loading indicator while fetching books */}
      {loading && <p className="loading">🔄 Loading books...</p>}

      {/* Show error message if there’s an error */}
      {error && <p className="error">{error}</p>}

      {/* Display list of books */}
      <div className="book-list">
        {books.map((book) => (
          <div
            key={book.key}
            className="book-card"
            onClick={() => openBookPage(book.key)} // Open book page on click
          >
            {/* Show book cover if available, else placeholder */}
            {book.cover_i ? (
              <img
                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                alt={book.title}
              />
            ) : (
              <div className="no-cover">No Cover</div>
            )}
            <h3>{book.title}</h3>
            <p><strong>Author:</strong> {book.author_name ? book.author_name.join(', ') : 'Unknown'}</p>
            <p><strong>Published:</strong> {book.first_publish_year || 'N/A'}</p>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {books.length > 0 && (
        <div className="pagination">
          <button onClick={handlePrevPage} disabled={page === 1}>
            ◀ Previous
          </button>
          <span>Page {page}</span>
          <button
            onClick={handleNextPage}
            disabled={page * BOOKS_PER_PAGE >= numFound}
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
