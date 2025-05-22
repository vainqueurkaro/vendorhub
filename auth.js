// Shared authenticator logic for all auth pages (multi-step signup included)

const usersKey = "vendorhub_users";
const sessionKey = "vendorhub_session";
const profileImageKey = "vendorhub_profile_img_"; // For separate image storage per user

function saveUsers(users) {
  localStorage.setItem(usersKey, JSON.stringify(users));
}

function getUsers() {
  return JSON.parse(localStorage.getItem(usersKey) || "[]");
}

function setSession(username) {
  localStorage.setItem(sessionKey, username);
}

function getSession() {
  return localStorage.getItem(sessionKey);
}

function showStep2() {
  document.getElementById('signup-step1').classList.add('hidden');
  document.getElementById('signup-step2').classList.remove('hidden');
}

function showStep1() {
  document.getElementById('signup-step2').classList.add('hidden');
  document.getElementById('signup-step1').classList.remove('hidden');
}

// Step 1: Credentials, trader, gender
function signUpStep1(event) {
  event.preventDefault();
  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value;
  const trader = document.getElementById('signup-trader').value;
  const gender = document.getElementById('signup-gender').value;
  const message = document.getElementById('signupMessageStep1');
  const users = getUsers();

  if (users.find(u => u.username === username)) {
    message.textContent = "Username already exists.";
    return;
  }
  if (!trader) {
    message.textContent = "Please select your field of trader.";
    return;
  }
  if (!gender) {
    message.textContent = "Please select your gender.";
    return;
  }
  // Store in sessionStorage temporarily for step 2
  sessionStorage.setItem("signup_tmp", JSON.stringify({ username, password, trader, gender }));
  showStep2();
}

// Step 2: Profile picture and bio
function signUpStep2(event) {
  event.preventDefault();
  const message = document.getElementById('signupMessageStep2');
  const bio = document.getElementById('signup-bio').value.trim();
  const photoInput = document.getElementById('signup-photo');
  const tmp = JSON.parse(sessionStorage.getItem("signup_tmp") || "{}");
  if (!tmp.username) {
    message.textContent = "Session expired. Please start again.";
    showStep1();
    return;
  }

  // Prepare user object
  const user = {
    username: tmp.username,
    password: tmp.password,
    trader: tmp.trader,
    gender: tmp.gender,
    bio: bio,
    profileImg: "" // Placeholder, will be set below
  };

  // Read image if selected
  if (photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      user.profileImg = e.target.result;
      completeSignUp(user, message);
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    completeSignUp(user, message);
  }
}

function completeSignUp(user, message) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
  if (user.profileImg) {
    localStorage.setItem(profileImageKey + user.username, user.profileImg);
  }
  message.textContent = "Account created! Please sign in.";
  sessionStorage.removeItem("signup_tmp");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1200);
}

// Login logic (for login.html)
function signIn(event) {
  event.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const message = document.getElementById('loginMessage');

  const users = getUsers();
  const found = users.find(u => u.username === username && u.password === password);
  if (found) {
    setSession(username);
    message.textContent = "Signed in! Redirecting...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } else {
    message.textContent = "Invalid username or password.";
  }
  event.target.reset();
}

// Forgot password logic (for forgot.html)
function forgotPassword(event) {
  event.preventDefault();
  const username = document.getElementById('forgot-username').value.trim();
  const message = document.getElementById('forgotMessage');
  const users = getUsers();

  if (users.find(u => u.username === username)) {
    message.textContent = "A reset link (simulated) has been sent to your email.";
  } else {
    message.textContent = "Username not found.";
  }
  event.target.reset();
}

// For displaying profile info & image on index.html
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

// For index.html: run showUserProfile on page load if profile section exists
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('profile-img')) {
    showUserProfile();
  }
});