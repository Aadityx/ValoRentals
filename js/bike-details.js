/* ============================================
   Bike Details Module (bike-details.js)
   ============================================
   Handles:
   - Read bike ID from URL parameters
   - Load and display bike details dynamically
   - "Book Now" button navigation
   - Auth check and logout
   - Mobile navigation
   ============================================ */

import {
  auth,
  signOut,
  onAuthStateChanged
} from './firebase-config.js';

// ---- Auth State Check ----
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'index.html';
  }
});

// ---- Get Bike ID from URL ----
const urlParams = new URLSearchParams(window.location.search);
const bikeId = parseInt(urlParams.get('id'));

// ---- Load Bike Data ----
// Retrieve bike data from localStorage (saved by dashboard.js)
const bikesData = JSON.parse(localStorage.getItem('valorentals_bikes') || '[]');

// Find the selected bike by ID
const bike = bikesData.find(b => b.id === bikeId);

if (bike) {
  // Populate the page with bike details
  document.getElementById('bikeName').textContent = bike.name;
  document.getElementById('bikePrice').innerHTML = `₹${bike.price} <span>/ day</span>`;
  document.getElementById('bikeImage').src = bike.image;
  document.getElementById('bikeImage').alt = bike.name;
  document.getElementById('bikeCC').textContent = bike.cc;
  document.getElementById('bikeMileage').textContent = bike.mileage;
  document.getElementById('bikeFuel').textContent = bike.fuel;
  document.getElementById('bikeType').textContent = bike.type;
  document.getElementById('bikeDescription').textContent = bike.description;

  // Set the "Book Now" link to booking page with bike ID
  document.getElementById('bookNowBtn').href = `booking.html?id=${bike.id}`;

  // Update page title
  document.title = `ValoRentals - ${bike.name}`;
} else {
  // Bike not found - show error state
  document.getElementById('bikeDetails').innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <div class="empty-icon">⚠️</div>
      <h3>Bike Not Found</h3>
      <p>The bike you're looking for doesn't exist or has been removed.</p>
      <a href="dashboard.html" class="btn btn-primary" style="margin-top: 16px;">Back to Dashboard</a>
    </div>
  `;
}

// ---- Mobile Navigation Toggle ----
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('open');
  }
});

// ---- Logout ----
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    localStorage.removeItem('valorentals_username');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
});
