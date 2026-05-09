/* ============================================
   History Module (history.js)
   ============================================
   Handles:
   - Fetch user's bookings from Firebase Firestore
   - Display booking history as responsive cards
   - Delete/cancel bookings
   - Confirmation modal for deletion
   - Auth check, mobile nav, logout
   ============================================ */

import {
  auth,
  db,
  signOut,
  onAuthStateChanged,
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from './firebase-config.js';

// ---- Auth State Check ----
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'index.html';
  } else {
    currentUser = user;
    // Fetch bookings once user is authenticated
    loadBookings();
  }
});

// ---- Load Bookings from Firestore ----
async function loadBookings() {
  const loader = document.getElementById('historyLoader');
  const cardsContainer = document.getElementById('historyCards');
  const emptyState = document.getElementById('emptyHistory');

  try {
    // Firebase Firestore: Query bookings for the current user
    // Using 'where' to filter by userId and 'orderBy' to sort by creation time
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', currentUser.uid)
    );

    const querySnapshot = await getDocs(q);

    // Hide loader
    loader.style.display = 'none';

    // Check if there are any bookings
    if (querySnapshot.empty) {
      emptyState.style.display = 'block';
      return;
    }

    // Build booking cards
    let html = '';
    const bookings = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      bookings.push({ id: docSnap.id, ...data });
    });

    // Sort by createdAt (newest first)
    bookings.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    bookings.forEach((booking) => {
      // Determine status class for the badge
      const statusClass = booking.status === 'confirmed' ? 'status-confirmed' :
                         booking.status === 'pending' ? 'status-pending' :
                         'status-cancelled';

      html += `
        <div class="history-card fade-in" id="booking-${booking.id}">
          <div class="history-info">
            <h4>${booking.bikeName}</h4>
            <div class="history-meta">
              <span class="meta-item">📅 ${formatDate(booking.pickupDate)} → ${formatDate(booking.returnDate)}</span>
              <span class="meta-item">📍 ${booking.pickupLocation}</span>
              <span class="meta-item">💰 ₹${booking.totalAmount?.toLocaleString('en-IN') || '0'}</span>
              <span class="meta-item">
                <span class="status-badge ${statusClass}">${booking.status}</span>
              </span>
            </div>
          </div>
          <div class="history-actions">
            <button class="btn btn-danger btn-sm" onclick="window.confirmDelete('${booking.id}')">
              🗑️ Cancel
            </button>
          </div>
        </div>
      `;
    });

    cardsContainer.innerHTML = html;

  } catch (error) {
    console.error('Error loading bookings:', error);
    loader.style.display = 'none';

    cardsContainer.innerHTML = `
      <div class="alert alert-error show">
        <span>❌</span>
        <span>Failed to load bookings. Please refresh the page.</span>
      </div>
    `;
  }
}

// ---- Format Date Helper ----
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-IN', options);
}

// ---- Delete Booking ----
let deleteBookingId = null;

// Global function for the delete confirmation
window.confirmDelete = function(bookingId) {
  deleteBookingId = bookingId;
  document.getElementById('deleteModal').classList.add('active');
};

// Cancel delete
document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
  deleteBookingId = null;
  document.getElementById('deleteModal').classList.remove('active');
});

// Confirm delete
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (!deleteBookingId) return;

  const btn = document.getElementById('confirmDeleteBtn');
  btn.textContent = 'Cancelling...';
  btn.disabled = true;

  try {
    // Firebase Firestore: Delete the booking document
    await deleteDoc(doc(db, 'bookings', deleteBookingId));

    // Remove the card from DOM with animation
    const card = document.getElementById(`booking-${deleteBookingId}`);
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateX(50px)';
      card.style.transition = 'all 0.3s ease';
      setTimeout(() => card.remove(), 300);
    }

    // Close modal
    document.getElementById('deleteModal').classList.remove('active');

    // Check if there are any remaining cards
    setTimeout(() => {
      const remaining = document.querySelectorAll('.history-card');
      if (remaining.length === 0) {
        document.getElementById('emptyHistory').style.display = 'block';
      }
    }, 400);

  } catch (error) {
    console.error('Delete error:', error);
    alert('Failed to cancel booking. Please try again.');
  } finally {
    btn.textContent = 'Cancel Booking';
    btn.disabled = false;
    deleteBookingId = null;
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
