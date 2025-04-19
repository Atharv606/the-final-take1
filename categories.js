console.log("Categories.js loaded");

const API_KEY = 'a1f306de';
const BASE_URL = 'https://www.omdbapi.com/';
const categoryImdbIds = {
    'Action': ['tt0111257', 'tt0258463', 'tt0381061', 'tt0936501', 'tt0455944', 'tt1392190', 'tt6146586', 'tt8936646', 'tt7888964', 'tt9603212'],
    'Comedy': ['tt1119646', 'tt0107048', 'tt0080339', 'tt0109686', 'tt0829482', 'tt0071853', 'tt0087332', 'tt0357413', 'tt0405422', 'tt0099785'],
    'Drama': ['tt0068646', 'tt0108052', 'tt0109830', 'tt0111161', 'tt0110912', 'tt0120689', 'tt0120338', 'tt0119217', 'tt0110357', 'tt2024544'],
    'Horror': ['tt0070047', 'tt0054215', 'tt0081505', 'tt0077651', 'tt0087800', 'tt1457767', 'tt5052448', 'tt7784604', 'tt1396484', 'tt2321549'],
    'Romance': ['tt0120338', 'tt0332280', 'tt0034583', 'tt0100405', 'tt3783958', 'tt0112471', 'tt0414387', 'tt0129387', 'tt2582846', 'tt0098635'],
    'Sci-Fi': ['tt0076759', 'tt0062622', 'tt0083658', 'tt0133093', 'tt0078748', 'tt2066051', 'tt0088763', 'tt0083866', 'tt1375666', 'tt1160419'],
    'Fantasy': ['tt0120737', 'tt0241527', 'tt0032138', 'tt0457430', 'tt0363771', 'tt0209144', 'tt0093779', 'tt1014759', 'tt0903624', 'tt3183660'],
    'Thriller': ['tt0114369', 'tt0102926', 'tt1375666', 'tt1392214', 'tt2267998', 'tt1130884', 'tt0209144', 'tt0167404', 'tt1210166', 'tt6751668'],
    'Adventure': ['tt0082971', 'tt0107290', 'tt0325980', 'tt0073195', 'tt0089218', 'tt0367882', 'tt0120616', 'tt0398286', 'tt0349903', 'tt1212428']
};

async function fetchMoviesByCategory(category) {
    console.log(`Fetching movies for category: ${category}`);
    const cacheKey = `genre_${category}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        console.log("Using cached data");
        return JSON.parse(cached);
    }

    const imdbIds = categoryImdbIds[category] || [];
    const movies = await Promise.all(imdbIds.map(async (imdbID) => {
        const response = await fetch(`${BASE_URL}?i=${imdbID}&apikey=${API_KEY}`);
        const data = await response.json();
        if (data.Response === 'True' && data.Genre && data.Genre.toLowerCase().includes(category.toLowerCase())) {
            console.log(`Fetched ${data.Title}`);
            return {
                imdbID: data.imdbID,
                Title: data.Title,
                Year: data.Year,
                imdbRating: data.imdbRating || 'N/A',
                Plot: data.Plot || 'No plot available.',
                Poster: data.Poster !== 'N/A' ? data.Poster : FALLBACK_IMAGE
            };
        }
        return null;
    }));
    const filteredMovies = movies.filter(m => m !== null).slice(0, 10);
    if (filteredMovies.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(filteredMovies));
        console.log(`Fetched ${filteredMovies.length} movies`);
    } else {
        console.warn("No movies found for category");
    }
    return filteredMovies;
}

function displayCategoryMovies(movies) {
    console.log("Starting displayCategoryMovies, movies length:", movies.length);
    const container = document.getElementById('category-movie-container');
    if (!container) {
        console.error("Error: container not found");
        showError("Error: Container not found");
        return;
    }
    container.innerHTML = '';
    if (movies.length === 0) {
        container.innerHTML = '<p class="fallback-message">No movies found in this category.</p>';
        showError("No movies available");
        return;
    }
    movies.forEach((movie) => {
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
                    <p class="rating"><strong>Rating:</strong> ${movie.imdbRating} ★</p>
                    <p class="plot"><strong>Plot:</strong> ${movie.Plot}</p>
                    <button class="trailer-button" onclick="window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title)}+trailer', '_blank')">🎬 Watch Trailer</button>
                    <button class="watchlist-button" onclick="addToWatchlist('${movie.imdbID}', '${movie.Title}', '${movie.Poster}', '${movie.Year}', '${movie.imdbRating}', '${movie.Plot}')">➕ Add to Watchlist</button>
                </div>
            </div>
        `;
        container.appendChild(movieElement);
    });
    console.log(`Rendered ${container.children.length} movies`);
}

function addToWatchlist(imdbID, title, poster, year, imdbRating, plot) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const movie = { imdbID, Title: title, Poster: poster, Year: year, imdbRating, Plot: plot };
    if (!watchlist.some(m => m.imdbID === imdbID)) {
        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        showError('Added to watchlist!');
    } else {
        showError('Already in watchlist.');
    }
}

function showError(message) {
    const toast = document.getElementById('error-toast');
    if (toast) {
        toast.textContent = message;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 3000);
    }
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

const FALLBACK_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'All';
    document.getElementById('category-name').textContent = `Selected Category: ${category}`;
    fetchMoviesByCategory(category).then(displayCategoryMovies);
    updateAuthLinks();
});