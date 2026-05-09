/* ============================================
   Authentication Module (auth.js)
   ============================================
   Handles:
   - User Registration with Firebase Auth
   - User Login with Firebase Auth
   - Form validation
   - Password toggle visibility
   - Error/success message display
   ============================================ */

import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from './firebase-config.js';

// ---- Check if user is already logged in ----
// If logged in, redirect to dashboard automatically
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'dashboard.html';
  }
});

// ---- Utility: Show alert messages ----
function showAlert(containerId, type, message) {
  const alert = document.getElementById(containerId);
  const icon = document.getElementById(containerId + 'Icon');
  const msg = document.getElementById(containerId + 'Msg');

  // Reset classes
  alert.className = 'alert show';

  if (type === 'success') {
    alert.classList.add('alert-success');
    icon.textContent = '✅';
  } else {
    alert.classList.add('alert-error');
    icon.textContent = '❌';
  }

  msg.textContent = message;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    alert.classList.remove('show');
  }, 5000);
}

// ---- Utility: Validate email format ----
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ---- Login Form Handler ----
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');

    // Validate fields
    if (!email || !password) {
      showAlert('loginAlert', 'error', 'Please fill in all fields.');
      return;
    }

    if (!isValidEmail(email)) {
      showAlert('loginAlert', 'error', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      showAlert('loginAlert', 'error', 'Password must be at least 6 characters.');
      return;
    }

    // Disable button and show loading
    btn.textContent = 'Signing in...';
    btn.disabled = true;

    try {
      // Firebase Authentication: Sign in with email and password
      await signInWithEmailAndPassword(auth, email, password);

      showAlert('loginAlert', 'success', 'Login successful! Redirecting...');

      // Redirect to dashboard after brief delay
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);

    } catch (error) {
      // Handle Firebase auth errors with user-friendly messages
      let errorMessage = 'Login failed. Please try again.';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try later.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
          break;
      }

      showAlert('loginAlert', 'error', errorMessage);

      btn.textContent = 'Sign In';
      btn.disabled = false;
    }
  });
}

// ---- Register Form Handler ----
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const btn = document.getElementById('registerBtn');

    // Validate all fields
    if (!name || !email || !password || !confirmPassword) {
      showAlert('registerAlert', 'error', 'Please fill in all fields.');
      return;
    }

    if (!isValidEmail(email)) {
      showAlert('registerAlert', 'error', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      showAlert('registerAlert', 'error', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('registerAlert', 'error', 'Passwords do not match.');
      return;
    }

    // Disable button and show loading
    btn.textContent = 'Creating Account...';
    btn.disabled = true;

    try {
      // Firebase Authentication: Create new user
      await createUserWithEmailAndPassword(auth, email, password);

      // Store user's name in localStorage for later use
      localStorage.setItem('valorentals_username', name);

      showAlert('registerAlert', 'success', 'Account created! Redirecting...');

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);

    } catch (error) {
      // Handle Firebase auth errors
      let errorMessage = 'Registration failed. Please try again.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Use at least 6 characters.';
          break;
      }

      showAlert('registerAlert', 'error', errorMessage);

      btn.textContent = 'Create Account';
      btn.disabled = false;
    }
  });
}

// ---- Password Visibility Toggle ----
// Made global so the onclick handler in HTML can access it
window.togglePassword = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
};
