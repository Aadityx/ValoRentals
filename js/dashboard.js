/* ============================================
   Dashboard Module (dashboard.js)
   ============================================
   Handles:
   - Auth state check (redirect if not logged in)
   - Bike data rendering with dynamic cards
   - Search functionality
   - Filter by fuel type
   - Sort by price/name
   - Mobile navigation toggle
   - Logout functionality
   ============================================ */

import {
  auth,
  signOut,
  onAuthStateChanged
} from './firebase-config.js';

// ---- Bike Data ----
// In a production app, this would come from Firestore
// Using local data for fast rendering and demo purposes
const bikesData = [
  {
    id: 1,
    name: "Royal Enfield Classic 350",
    price: 799,
    cc: "349cc",
    mileage: "40 km/l",
    fuel: "Petrol",
    type: "Cruiser",
    image: "images/classic350.avif",
    description: "The timeless Classic 350 offers a perfect blend of heritage and modern engineering. With its iconic thumping exhaust note and comfortable ergonomics, this bike is ideal for long highway rides and city commutes alike."
  },
  {
    id: 2,
    name: "KTM Duke 200",
    price: 899,
    cc: "199.5cc",
    mileage: "35 km/l",
    fuel: "Petrol",
    type: "Sport",
    image: "images/duke200.jpg",
    description: "The KTM Duke 200 is an aggressive street fighter that delivers raw performance. Its lightweight chassis and powerful engine make it the perfect companion for adrenaline-fueled rides through city streets."
  },
  {
    id: 3,
    name: "Honda Activa 6G",
    price: 399,
    cc: "109.51cc",
    mileage: "55 km/l",
    fuel: "Petrol",
    type: "Scooter",
    image: "images/activa6g.avif",
    description: "India's best-selling scooter combines reliability with comfort. The Activa 6G features an efficient engine, spacious under-seat storage, and a smooth ride that makes daily commuting a breeze."
  },
  {
    id: 4,
    name: "Yamaha R15 V4",
    price: 999,
    cc: "155cc",
    mileage: "42 km/l",
    fuel: "Petrol",
    type: "Sport",
    image: "images/r15v4.avif",
    description: "The Yamaha R15 V4 is a supersport machine dressed in racing DNA. With variable valve actuation technology and an aggressive riding posture, it delivers track-inspired performance on every road."
  },
  {
    id: 5,
    name: "Ather 450X",
    price: 699,
    cc: "Electric",
    mileage: "105 km/charge",
    fuel: "Electric",
    type: "Scooter",
    image: "images/ather450x.webp",
    description: "The Ather 450X is India's smartest electric scooter. With a touchscreen dashboard, onboard navigation, fast charging, and exhilarating acceleration, it redefines the future of urban commuting."
  },
  {
    id: 6,
    name: "Bajaj Pulsar NS200",
    price: 649,
    cc: "199.5cc",
    mileage: "38 km/l",
    fuel: "Petrol",
    type: "Sport",
    image: "images/ns200.jpg",
    description: "The Pulsar NS200 brings track-bred technology to the streets. Its liquid-cooled engine, perimeter frame, and aggressive styling make it a favorite among performance enthusiasts on a budget."
  },
  {
    id: 7,
    name: "TVS Jupiter 125",
    price: 349,
    cc: "124.8cc",
    mileage: "52 km/l",
    fuel: "Petrol",
    type: "Scooter",
    image: "images/jupiter125.jpg",
    description: "The TVS Jupiter 125 offers premium features with everyday practicality. Its smooth engine, comfortable seat, and excellent mileage make it perfect for families and daily commuters."
  },
  {
    id: 8,
    name: "Kawasaki Ninja 300",
    price: 1299,
    cc: "296cc",
    mileage: "30 km/l",
    fuel: "Petrol",
    type: "Sport",
    image: "images/ninja300.jpg",
    description: "The Kawasaki Ninja 300 is a thoroughbred sportbike that offers razor-sharp handling and a refined parallel-twin engine. Perfect for weekend track days or spirited rides through mountain roads."
  },
  {
    id: 9,
    name: "Revolt RV400",
    price: 599,
    cc: "Electric",
    mileage: "150 km/charge",
    fuel: "Electric",
    type: "Standard",
    image: "images/rv400.avif",
    description: "The Revolt RV400 is a futuristic electric motorcycle that combines AI with sustainable mobility. With its removable battery, smartphone connectivity, and silent operation, it leads the electric revolution."
  }
];

// Store bike data globally for other pages to access
localStorage.setItem('valorentals_bikes', JSON.stringify(bikesData));

// ---- Auth State Check ----
// Redirect to login if user is not authenticated
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'index.html';
  }
});

// ---- Render Bike Cards ----
function renderBikes(bikes) {
  const grid = document.getElementById('bikesGrid');
  const emptyState = document.getElementById('emptyState');

  // Show empty state if no bikes match
  if (bikes.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  // Build HTML for each bike card
  grid.innerHTML = bikes.map(bike => `
    <div class="card" data-id="${bike.id}">
      <div class="card-image">
        <img src="${bike.image}" alt="${bike.name}" loading="lazy">
        <div class="card-badge">${bike.fuel}</div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${bike.name}</h3>
        <div class="card-specs">
          <span class="spec">⚡ ${bike.cc}</span>
          <span class="spec">⛽ ${bike.mileage}</span>
          <span class="spec">🏷️ ${bike.type}</span>
        </div>
        <div class="card-price">₹${bike.price} <span>/ day</span></div>
      </div>
      <div class="card-footer">
        <a href="bike-details.html?id=${bike.id}" class="btn btn-primary btn-block">View Details</a>
      </div>
    </div>
  `).join('');
}

// ---- Search & Filter Logic ----
function filterAndRenderBikes() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const fuelFilter = document.getElementById('fuelFilter').value;
  const sortFilter = document.getElementById('sortFilter').value;

  // Filter bikes based on search and fuel type
  let filtered = bikesData.filter(bike => {
    const matchesSearch = bike.name.toLowerCase().includes(searchTerm);
    const matchesFuel = fuelFilter === 'all' || bike.fuel === fuelFilter;
    return matchesSearch && matchesFuel;
  });

  // Sort the filtered results
  switch (sortFilter) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  renderBikes(filtered);
}

// ---- Event Listeners for Search/Filter ----
document.getElementById('searchInput').addEventListener('input', filterAndRenderBikes);
document.getElementById('fuelFilter').addEventListener('change', filterAndRenderBikes);
document.getElementById('sortFilter').addEventListener('change', filterAndRenderBikes);

// ---- Mobile Navigation Toggle ----
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile menu when a link is clicked
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
    // Firebase: Sign out the current user
    await signOut(auth);
    // Clear local storage
    localStorage.removeItem('valorentals_username');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
});

// ---- Initial Render ----
renderBikes(bikesData);
