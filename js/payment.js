/* ============================================
   Payment Module (payment.js)
   ============================================
   Handles:
   - Display booking summary for payment
   - Demo payment UI (UPI, Card, Cash)
   - Save payment status to Firebase Firestore
   - Update booking status to 'confirmed'
   - Show success modal on completion
   ============================================ */

import {
  auth,
  db,
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp
} from './firebase-config.js';

// ---- Auth State Check ----
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'index.html';
  } else {
    currentUser = user;
  }
});

// ---- Load Current Booking ----
const booking = JSON.parse(localStorage.getItem('valorentals_current_booking'));

if (booking) {
  // Populate payment summary
  document.getElementById('payBike').textContent = booking.bikeName;
  document.getElementById('payDays').textContent = `${booking.totalDays} day${booking.totalDays > 1 ? 's' : ''}`;
  document.getElementById('payLocation').textContent = booking.pickupLocation;
  document.getElementById('payTotal').textContent = `₹${booking.totalAmount.toLocaleString('en-IN')}`;
} else {
  // No booking found, redirect to dashboard
  window.location.href = 'dashboard.html';
}

// ---- Show Alert ----
function showAlert(type, message) {
  const alert = document.getElementById('paymentAlert');
  const icon = document.getElementById('paymentAlertIcon');
  const msg = document.getElementById('paymentAlertMsg');

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

// ---- Confirm Payment ----
document.getElementById('confirmPayBtn').addEventListener('click', async () => {
  const method = window.__selectedPaymentMethod;
  const btn = document.getElementById('confirmPayBtn');

  if (!method) {
    showAlert('error', 'Please select a payment method.');
    return;
  }

  // Basic validation for payment method details
  if (method === 'upi') {
    const upiId = document.getElementById('upiId').value.trim();
    if (!upiId) {
      showAlert('error', 'Please enter your UPI ID.');
      return;
    }
  }

  if (method === 'card') {
    const cardNum = document.getElementById('cardNumber').value.trim();
    const cardExpiry = document.getElementById('cardExpiry').value.trim();
    const cardCvv = document.getElementById('cardCvv').value.trim();
    if (!cardNum || !cardExpiry || !cardCvv) {
      showAlert('error', 'Please fill in all card details.');
      return;
    }
  }

  // Disable button and show loading
  btn.textContent = 'Processing...';
  btn.disabled = true;

  try {
    // Firebase Firestore: Save payment record to 'payments' collection
    const paymentData = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      bookingId: booking.bookingId,
      bikeName: booking.bikeName,
      amount: booking.totalAmount,
      paymentMethod: method,
      status: 'completed',
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'payments'), paymentData);

    // Firebase Firestore: Update booking status to 'confirmed'
    const bookingRef = doc(db, 'bookings', booking.bookingId);
    await updateDoc(bookingRef, {
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: method
    });

    // Clear current booking from localStorage
    localStorage.removeItem('valorentals_current_booking');

    // Show success modal
    document.getElementById('successModal').classList.add('active');

  } catch (error) {
    console.error('Payment error:', error);
    showAlert('error', 'Payment failed. Please try again.');
    btn.textContent = 'Confirm Payment';
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
