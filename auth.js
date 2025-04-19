const params = new URLSearchParams(window.location.search);
const mode = params.get('mode') || 'signin';

function setupAuthForm() {
    const title = document.getElementById('auth-title');
    const button = document.getElementById('auth-button');
    const switchText = document.getElementById('auth-switch');

    if (mode === 'login') {
        title.textContent = 'Log In';
        button.textContent = 'Log In';
        switchText.innerHTML = 'Don\'t have an account? <a href="auth.html?mode=signin">Sign In</a>';
    } else {
        title.textContent = 'Sign In';
        button.textContent = 'Sign In';
        switchText.innerHTML = 'Already have an account? <a href="auth.html?mode=login">Log In</a>';
    }

    button.onclick = () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            showError('Please fill in all fields.');
            return;
        }

        if (mode === 'signin') {
            const users = JSON.parse(localStorage.getItem('users')) || {};
            if (users[username]) {
                showError('Username already exists.');
                return;
            }
            users[username] = password;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', username);
            showError('Signed in successfully!');
            setTimeout(() => window.location.href = 'index.html', 1000);
        } else {
            const users = JSON.parse(localStorage.getItem('users')) || {};
            if (users[username] && users[username] === password) {
                localStorage.setItem('currentUser', username);
                showError('Logged in successfully!');
                setTimeout(() => window.location.href = 'index.html', 1000);
            } else {
                showError('Invalid username or password.');
            }
        }
    };
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

setupAuthForm();
updateAuthLinks();