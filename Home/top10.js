const API_KEY = 'a1f306de';
const BASE_URL = 'https://www.omdbapi.com/';

const top10Movies = [
    "The Shawshank Redemption", "The Godfather", "The Dark Knight",
    "Pulp Fiction", "Fight Club", "Forrest Gump", "Inception",
    "The Empire Strikes Back", "The Matrix", "Good Will Hunting"
];

const top10TVShows = [
    "Breaking Bad", "Game of Thrones", "The Sopranos", "The Wire",
    "Chernobyl", "Band of Brothers", "Fargo", "True Detective",
    "Stranger Things", "The Office"
];

async function fetchMovieByTitle(title) {
    const cacheKey = `movie_${title}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
        const response = await fetch(`${BASE_URL}?t=${encodeURIComponent(title)}&apikey=${API_KEY}`);
        const data = await response.json();
        if (data.Response === 'True') {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            return data;
        }
        throw new Error(data.Error || 'Movie not found');
    } catch (error) {
        console.error(`Error fetching movie "${title}":`, error);
        return null;
    }
}

async function fetchTop10() {
    document.getElementById('top10-movies').innerHTML = '<div class="loading">Loading movies...</div>';
    document.getElementById('top10-tvshows').innerHTML = '<div class="loading">Loading TV shows...</div>';

    const movies = await Promise.all(top10Movies.map(title => fetchMovieByTitle(title)));
    const tvShows = await Promise.all(top10TVShows.map(title => fetchMovieByTitle(title)));

    displayMovies(movies, 'top10-movies');
    displayMovies(tvShows, 'top10-tvshows');
}

function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (!movies || movies.length === 0) {
        container.innerHTML = '<p>No items found.</p>';
        return;
    }

    movies
        .filter(movie => movie && movie.Response === 'True')
        .forEach((movie, index) => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie-card');
            movieElement.innerHTML = `
                <div class="movie-inner">
                    <div class="movie-front">
                        <img src="${movie.Poster}" alt="${movie.Title}" loading="lazy">
                    </div>
                    <div class="movie-back">
                        <h3 class="ranked-title">${index + 1}. ${movie.Title}</h3>
                        <p><strong>Year:</strong> ${movie.Year}</p>
                        <p class="rating" data-rating="${movie.imdbRating || 'N/A'}"><strong>Rating:</strong> ${movie.imdbRating || 'N/A'} ★</p>
                        <p class="plot"><strong>Plot:</strong> ${movie.Plot?.substring(0, 100) || 'N/A'}...</p>
                        <button class="trailer-button" onclick="window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title)}+trailer', '_blank')">🎬 Watch Trailer</button>
                        <button class="watchlist-button" onclick="addToWatchlist('${movie.imdbID}', '${movie.Title}', '${movie.Poster}', '${movie.Year}', '${movie.imdbRating}', '${movie.Plot?.replace(/'/g, "\\'") || 'N/A'}')">➕ Add to Watchlist</button>
                    </div>
                </div>
            `;
            container.appendChild(movieElement);
        });
}

function addToWatchlist(imdbID, title, poster, year, imdbRating, plot) {
    try {
        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        const movie = { imdbID, Title: title, Poster: poster, Year: year, imdbRating, Plot: plot };
        if (!watchlist.some(m => m.imdbID === imdbID)) {
            watchlist.push(movie);
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            showError('Added to watchlist!');
            console.log('Added to watchlist:', movie);
        } else {
            showError('Already in watchlist.');
            console.log('Movie already in watchlist:', imdbID);
        }
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        showError('Error adding to watchlist.');
    }
}

function showError(message) {
    const toast = document.getElementById('error-toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => (toast.style.display = 'none'), 3000);
}

function updateAuthLinks() {
    const user = localStorage.getItem('currentUser');
    const signinLink = document.getElementById('signin-link');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const userDisplay = document.getElementById('user-display');

    if (user) {
        signinLink.style.display = 'none';
        loginLink.style.display = 'none';
        logoutLink.style.display = 'inline';
        userDisplay.textContent = `Welcome, ${user}`;
        logoutLink.onclick = () => {
            localStorage.removeItem('currentUser');
            window.location.reload();
        };
    } else {
        signinLink.style.display = 'inline';
        loginLink.style.display = 'inline';
        logoutLink.style.display = 'none';
        userDisplay.textContent = '';
    }
}

fetchTop10();
updateAuthLinks();