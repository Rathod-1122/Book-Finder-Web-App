
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [numFound, setNumFound] = useState(0);

  const BOOKS_PER_PAGE = 10;

  const searchBooks = async (newPage = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setBooks([]);
    setPage(newPage);

    try {
      const response = await axios.get(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&page=${newPage}`
      );

      const data = response.data;
      setNumFound(data.numFound);

      if (data.docs.length === 0) {
        setError('No books found. Try a different title.');
      } else {
        setBooks(data.docs.slice(0, BOOKS_PER_PAGE)); // Limiting to 10 books per page
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch books. Please try again.');
    }

    setLoading(false);
  };

  const openBookPage = (key) => {
    const url = `https://openlibrary.org${key}`;
    window.open(url, '_blank');
  };

  const handleNextPage = () => {
    if (page * BOOKS_PER_PAGE < numFound) {
      searchBooks(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      searchBooks(page - 1);
    }
  };

  return (
    <div className="app">
      <h1>📚 Book Finder</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search books by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchBooks(1)}
        />
        <button onClick={() => searchBooks(1)}>Search</button>
      </div>

      {loading && <p className="loading">🔄 Loading books...</p>}
      {error && <p className="error">{error}</p>}

      <div className="book-list">
        {books.map((book) => (
          <div
            key={book.key}
            className="book-card"
            onClick={() => openBookPage(book.key)}
          >
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
