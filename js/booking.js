/* ============================================
   Booking Module (booking.js)
   ============================================
   Handles:
   - Load selected bike info from URL
   - Booking form submission
   - Auto-calculate rental days & total price
   - Display booking summary
   - Save booking to Firebase Firestore
   - Redirect to payment page
   ============================================ */

import {
  auth,
  db,
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  serverTimestamp
} from './firebase-config.js';

// ---- Auth State Check ----
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'index.html';
  } else {
    currentUser = user;
    // Pre-fill name from localStorage if available
    const savedName = localStorage.getItem('valorentals_username');
    if (savedName) {
      document.getElementById('userName').value = savedName;
    }
  }
});

// ---- Get Bike from URL ----
const urlParams = new URLSearchParams(window.location.search);
const bikeId = parseInt(urlParams.get('id'));

// Load bike data
const bikesData = JSON.parse(localStorage.getItem('valorentals_bikes') || '[]');
const bike = bikesData.find(b => b.id === bikeId);

if (bike) {
  document.getElementById('bookingBikeName').textContent = bike.name;
} else {
  // Redirect back if no valid bike
  window.location.href = 'dashboard.html';
}

// ---- Set Minimum Dates ----
// Pickup date should be today or later
const today = new Date().toISOString().split('T')[0];
document.getElementById('pickupDate').min = today;
document.getElementById('returnDate').min = today;

// ---- Auto-Calculate Rental Summary ----
function updateSummary() {
  const pickupDate = document.getElementById('pickupDate').value;
  const returnDate = document.getElementById('returnDate').value;
  const summary = document.getElementById('bookingSummary');

  if (!pickupDate || !returnDate || !bike) {
    summary.style.display = 'none';
    return;
  }

  // Calculate number of days
  const pickup = new Date(pickupDate);
  const returnD = new Date(returnDate);
  const diffTime = returnD - pickup;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days <= 0) {
    summary.style.display = 'none';
    return;
  }

  // Calculate total price
  const total = days * bike.price;

  // Show summary
  summary.style.display = 'block';
  document.getElementById('summaryBike').textContent = bike.name;
  document.getElementById('summaryPickup').textContent = formatDate(pickupDate);
  document.getElementById('summaryReturn').textContent = formatDate(returnDate);
  document.getElementById('summaryDays').textContent = `${days} day${days > 1 ? 's' : ''}`;
  document.getElementById('summaryRate').textContent = `₹${bike.price}`;
  document.getElementById('summaryTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
}

// ---- Format Date Helper ----
function formatDate(dateStr) {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-IN', options);
}

// ---- Event Listeners for Date Changes ----
document.getElementById('pickupDate').addEventListener('change', (e) => {
  // Set minimum return date to pickup date
  document.getElementById('returnDate').min = e.target.value;
  updateSummary();
});

document.getElementById('returnDate').addEventListener('change', updateSummary);

// ---- Show Alert ----
function showAlert(type, message) {
  const alert = document.getElementById('bookingAlert');
  const icon = document.getElementById('bookingAlertIcon');
  const msg = document.getElementById('bookingAlertMsg');

  alert.className = 'alert show';
  if (type === 'success') {
    alert.classList.add('alert-success');
    icon.textContent = '✅';
  } else {
    alert.classList.add('alert-error');
    icon.textContent = '❌';
  }
  msg.textContent = message;

  setTimeout(() => alert.classList.remove('show'), 5000);
}

// ---- Booking Form Submission ----
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const userName = document.getElementById('userName').value.trim();
  const phone = document.getElementById('userPhone').value.trim();
  const pickupDate = document.getElementById('pickupDate').value;
  const returnDate = document.getElementById('returnDate').value;
  const location = document.getElementById('pickupLocation').value;
  const btn = document.getElementById('proceedBtn');

  // Validate all fields
  if (!userName || !phone || !pickupDate || !returnDate || !location) {
    showAlert('error', 'Please fill in all fields.');
    return;
  }

  // Validate phone number (10 digits)
  if (!/^[0-9]{10}$/.test(phone)) {
    showAlert('error', 'Please enter a valid 10-digit phone number.');
    return;
  }

  // Validate dates
  const pickup = new Date(pickupDate);
  const returnD = new Date(returnDate);
  const days = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));

  if (days <= 0) {
    showAlert('error', 'Return date must be after pickup date.');
    return;
  }

  // Calculate total
  const totalAmount = days * bike.price;

  // Disable button
  btn.textContent = 'Processing...';
  btn.disabled = true;

  try {
    // Firebase Firestore: Save booking document to 'bookings' collection
    const bookingData = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: userName,
      phone: phone,
      bikeId: bike.id,
      bikeName: bike.name,
      bikeImage: bike.image,
      pricePerDay: bike.price,
      pickupDate: pickupDate,
      returnDate: returnDate,
      pickupLocation: location,
      totalDays: days,
      totalAmount: totalAmount,
      status: 'pending', // Will be updated to 'confirmed' after payment
      paymentStatus: 'unpaid',
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'bookings'), bookingData);

    // Store booking ID for payment page
    localStorage.setItem('valorentals_current_booking', JSON.stringify({
      bookingId: docRef.id,
      ...bookingData
    }));

    showAlert('success', 'Booking created! Redirecting to payment...');

    // Redirect to payment page
    setTimeout(() => {
      window.location.href = 'payment.html';
    }, 1500);

  } catch (error) {
    console.error('Booking error:', error);
    showAlert('error', 'Failed to create booking. Please try again.');
    btn.textContent = 'Proceed to Payment →';
    btn.disabled = false;
  }
});

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
