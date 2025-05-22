// This file is for index.html navigation/auth/logout/profile only

const usersKey = "vendorhub_users";
const sessionKey = "vendorhub_session";

function getUsers() {
  return JSON.parse(localStorage.getItem(usersKey) || "[]");
}
function getSession() {
  return localStorage.getItem(sessionKey);
}
function clearSession() {
  localStorage.removeItem(sessionKey);
}
function logout() {
  clearSession();
  location.reload();
}

function showPage(pageId) {
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(sec => sec.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(pageId)) {
      link.classList.add('active');
    }
  });
}

function submitContact(event) {
  event.preventDefault();
  document.getElementById('formMessage').textContent = "Thank you for contacting us! We'll be in touch soon.";
  event.target.reset();
}

function updateNav() {
  const loggedIn = !!getSession();
  document.getElementById("signin-link").classList.toggle("hidden", loggedIn);
  document.getElementById("signup-link").classList.toggle("hidden", loggedIn);
  document.getElementById("logout-link").classList.toggle("hidden", !loggedIn);

  // Restrict access to courses if not logged in
  const courseNavLink = document.querySelector('a[href="#courses"]');
  if (!loggedIn) {
    courseNavLink.setAttribute('onclick', "alert('Please sign in to access courses.');window.location='login.html';");
    document.getElementById('profile-section').style.display = "none";
  } else {
    courseNavLink.setAttribute('onclick', "showPage('courses');");
    document.getElementById('profile-section').style.display = "block";
  }
}

// Show profile info
function showUserProfile() {
  const username = getSession();
  if (!username) return;
  const users = getUsers();
  const user = users.find(u => u.username === username);
  if (!user) return;
  // Profile picture
  const img = document.getElementById('profile-img');
  if (img && user.profileImg) img.src = user.profileImg;
  // Username
  const uname = document.getElementById('profile-username');
  if (uname) uname.textContent = user.username;
  // Trader field
  const trader = document.getElementById('profile-trader');
  if (trader) trader.textContent = user.trader;
  // Gender
  const gender = document.getElementById('profile-gender');
  if (gender) gender.textContent = user.gender;
  // Bio
  const bio = document.getElementById('profile-bio');
  if (bio) bio.textContent = user.bio || "";
}

// On page load, show the correct section based on hash (optional)
window.addEventListener('DOMContentLoaded', () => {
  let hash = window.location.hash.replace('#', '');
  if (["home", "courses", "address", "contact"].includes(hash)) {
    showPage(hash);
  } else {
    showPage('home');
  }
  updateNav();
  showUserProfile();
});

window.addEventListener('storage', () => {
  updateNav();
  showUserProfile();
});