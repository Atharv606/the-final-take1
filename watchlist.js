function getWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    console.log('Retrieved watchlist:', watchlist);
    return watchlist;
}

function removeFromWatchlist(imdbID) {
    const watchlist = getWatchlist().filter(movie => movie.imdbID !== imdbID);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    showError('Removed from watchlist!');
    displayWatchlist();
}

function displayWatchlist() {
    const container = document.getElementById('watchlist-movies');
    const watchlist = getWatchlist();
    container.innerHTML = '';

    if (watchlist.length === 0) {
        container.innerHTML = '<p>Your watchlist is empty.</p>';
        return;
    }

    watchlist.forEach(movie => {
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
                    <p class="rating"><strong>Rating:</strong> ${movie.imdbRating || 'N/A'} ★</p>
                    <p class="plot"><strong>Plot:</strong> ${movie.Plot?.substring(0, 100) || 'N/A'}...</p>
                    <button class="trailer-button" onclick="window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title)}+trailer', '_blank')">🎬 Watch Trailer</button>
                    <button class="remove-button" onclick="removeFromWatchlist('${movie.imdbID}')">❌ Remove</button>
                </div>
            </div>
        `;
        container.appendChild(movieElement);
    });
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

displayWatchlist();
updateAuthLinks();