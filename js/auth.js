// ==========================================================================
// MedLink — auth.js
// Handles client-side validation AND real submission to the backend for
// login/signup. Requires js/api.js to be loaded first.
// ==========================================================================

function showError(fieldId, show) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.toggle('has-error', show);
}

function showBanner(message, type) {
  const banner = document.getElementById('statusBanner');
  if (!banner) return;
  banner.textContent = message;
  banner.className = `status-banner show ${type}`;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// If someone who's already logged in lands back on the login/signup page,
// just send them straight to the dashboard.
if (getToken()) {
  window.location.href = 'dashboard.html';
}

// ---------- Login form ----------

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let valid = true;

    const emailOk = isValidEmail(email);
    showError('emailField', !emailOk);
    if (!emailOk) valid = false;

    const passwordOk = password.length > 0;
    showError('passwordField', !passwordOk);
    if (!passwordOk) valid = false;

    if (!valid) {
      showBanner('Please fix the highlighted fields.', 'error');
      return;
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    showBanner('Logging in...', 'success');

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setSession(data.token, data.user);
      showBanner('Logged in — redirecting...', 'success');
      window.location.href = 'dashboard.html';
    } catch (err) {
      showBanner(err.message, 'error');
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// ---------- Signup form ----------

const signupForm = document.getElementById('signupForm');

if (signupForm) {

  // Swap labels depending on role, since a distributor's "business" isn't a pharmacy
  const roleInputs = document.querySelectorAll('input[name="role"]');
  const businessLabel = document.getElementById('businessLabel');
  const businessInput = document.getElementById('businessName');
  const licenseLabel = document.getElementById('licenseLabel');

  function updateRoleLabels() {
    const selected = document.querySelector('input[name="role"]:checked').value;
    if (selected === 'DISTRIBUTOR') {
      businessLabel.textContent = 'Company / warehouse name';
      businessInput.placeholder = 'e.g. Apex Pharma Distributors';
      licenseLabel.textContent = 'Wholesale drug license number';
    } else {
      businessLabel.textContent = 'Pharmacy name';
      businessInput.placeholder = 'e.g. Sunrise Medicals';
      licenseLabel.textContent = 'Drug license number';
    }
  }

  roleInputs.forEach(input => input.addEventListener('change', updateRoleLabels));
  updateRoleLabels();

  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const role = document.querySelector('input[name="role"]:checked').value;
    const name = document.getElementById('name').value.trim();
    const businessName = document.getElementById('businessName').value.trim();
    const licenseNumber = document.getElementById('license').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let valid = true;

    const nameOk = name.length > 0;
    showError('nameField', !nameOk);
    if (!nameOk) valid = false;

    const businessOk = businessName.length > 0;
    showError('businessField', !businessOk);
    if (!businessOk) valid = false;

    const licenseOk = licenseNumber.length > 0;
    showError('licenseField', !licenseOk);
    if (!licenseOk) valid = false;

    const emailOk = isValidEmail(email);
    showError('emailField', !emailOk);
    if (!emailOk) valid = false;

    const passwordOk = password.length >= 8;
    showError('passwordField', !passwordOk);
    if (!passwordOk) valid = false;

    const confirmOk = password === confirmPassword && confirmPassword.length > 0;
    showError('confirmField', !confirmOk);
    if (!confirmOk) valid = false;

    if (!valid) {
      showBanner('Please fix the highlighted fields.', 'error');
      return;
    }

    const submitBtn = signupForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    showBanner('Creating your account...', 'success');

    try {
      const data = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ role, name, businessName, licenseNumber, email, password }),
      });
      setSession(data.token, data.user);
      showBanner('Account created — redirecting...', 'success');
      window.location.href = 'dashboard.html';
    } catch (err) {
      showBanner(err.message, 'error');
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
