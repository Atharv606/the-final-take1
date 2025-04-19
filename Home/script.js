const API_KEY = 'a1f306de';
const BASE_URL = 'https://www.omdbapi.com/';

const trendingTitles = [
    "Inception", "Goodfellas", "Taxi Driver", "Se7en", "Fight Club", "The Dark Knight",
    "Interstellar", "Titanic", "Avatar", "Breaking Bad", "Stranger Things",
    "Game of Thrones", "The Witcher", "The Office", "The Godfather"
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

async function fetchTrending() {
    document.getElementById('movie-container').innerHTML = '<div class="loading">Loading movies...</div>';
    const movies = await Promise.all(trendingTitles.map(title => fetchMovieByTitle(title)));
    displayMovies(movies, 'movie-container');
}

async function searchMovies() {
    const query = document.getElementById('search-box').value.trim();
    if (!query) return;

    document.getElementById('movie-container').innerHTML = '<div class="loading">Loading movies...</div>';
    try {
        const response = await fetch(`${BASE_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`);
        const data = await response.json();
        if (data.Response === 'True') {
            const detailedMovies = await Promise.all(
                data.Search.slice(0, 10).map(async movie => {
                    const detailResponse = await fetch(`${BASE_URL}?i=${movie.imdbID}&apikey=${API_KEY}`);
                    return await detailResponse.json();
                })
            );
            displayMovies(detailedMovies, 'movie-container');
        } else {
            document.getElementById('movie-container').innerHTML = '<p>No movies found.</p>';
            showError('No movies found for your search.');
        }
    } catch (error) {
        console.error('Error searching movies:', error);
        document.getElementById('movie-container').innerHTML = '<p>Error fetching movies. Please try again.</p>';
        showError('Error fetching movies.');
    }
}

function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (!movies || movies.length === 0) {
        container.innerHTML = '<p>No movies found.</p>';
        return;
    }

    movies
        .filter(movie => movie && movie.Response === 'True')
        .forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie-card');
            movieElement.innerHTML = `
                <div class="movie-inner">
                    <div class="movie-front">
                        <img src="${movie.Poster}" alt="${movie.Title}" loading="lazy">
                    </div>
                    <div class="movie-back">
                        <h3>${movie.Title}</h3>
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

document.getElementById('search-button').addEventListener('click', searchMovies);

let debounceTimeout;
document.getElementById('search-box').addEventListener('input', function () {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(searchMovies, 500);
});

document.getElementById('search-box').addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        clearTimeout(debounceTimeout);
        searchMovies();
    }
});

fetchTrending();
updateAuthLinks();

document.getElementById('category').addEventListener('change', function () {
    const category = this.value;
    if (category) {
        window.location.href = category;
    }
});