document.addEventListener("DOMContentLoaded", () => {

    // 1. Check if user is already logged in
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
        window.location.href = 'overview.html';
        return; // Stop execution if already logged in
    }

    // 2. Select elements from your specific HTML structure
    const loginForm = document.querySelector('form');
    const emailInput = document.querySelectorAll('.input-field input')[0];
    const passwordInput = document.querySelectorAll('.input-field input')[1];
    const eyeIcon = document.querySelector('.fa-eye');
    const socialBtns = document.querySelectorAll('.social-btn');
    const forgotPasswordBtn = document.querySelector('.forgot');

    // 3. Password Visibility Toggle
    if (eyeIcon && passwordInput) {
        eyeIcon.style.cursor = 'pointer'; // Make it look clickable

        eyeIcon.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash'); // Changes icon to crossed-out eye
            } else {
                passwordInput.type = 'password';
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
        });
    }

    // 4. Handle Login Submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevents the page from refreshing

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // --- ADMIN BYPASS ---
            if (email === 'admin' && password === 'admin') {
                localStorage.setItem('userToken', 'admin_mock_token_123');
                localStorage.setItem('userName', 'John Doe');
                window.location.href = 'overview.html';
                return;
            }

            // --- MOCK DATABASE CHECK ---
            // Fetches any users that might have been registered previously
            const savedUsers = JSON.parse(localStorage.getItem('agriNUE_users')) || [];
            const foundUser = savedUsers.find(u => u.email === email && u.password === password);

            if (foundUser) {
                // Success! Set token and redirect
                localStorage.setItem('userToken', `user_token_${foundUser.email}`);
                // user name fetch karega
                let displayName = foundUser.name || email.split('@')[0];
                displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                localStorage.setItem('userName', displayName);
                // <----------------------->
                window.location.href = 'overview.html';
            } else {
                // Failure: Show error (Using an alert since there's no error div in the HTML)
                alert("Invalid credentials. Please try again or use 'admin' / 'admin'.");
                passwordInput.value = ''; // Clear the password field for retry
            }
        });
    }

    // 5. Placeholder Actions for extra buttons
    socialBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alert("Social login integration is currently under development.");
        });
    });

    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', () => {
            alert("Password reset link would be sent to your registered email or phone.");
        });
    }
});