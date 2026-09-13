// ==========================================================================
// MedLink — support.js
// ==========================================================================

document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();
  const status = document.getElementById('contactStatus');

  if (!subject || !message) {
    status.textContent = 'Please fill in both fields.';
    status.className = 'status-banner show error';
    return;
  }

  status.textContent = 'Your message is ready to send — this will connect to the support inbox once the backend is wired up.';
  status.className = 'status-banner show success';
  this.reset();
});

document.querySelectorAll('.faq-item').forEach(function (item) {
  item.querySelector('.faq-q').addEventListener('click', function () {
    item.classList.toggle('open');
  });
});

// ---------- Real feedback submission ----------

let selectedRating = 0;

function paintStars(upTo) {
  document.querySelectorAll('#starRow .star').forEach(s => {
    s.style.color = parseInt(s.dataset.value, 10) <= upTo ? 'var(--accent-amber)' : 'var(--border)';
  });
}

const starRowEl = document.getElementById('starRow');
if (starRowEl) {
  starRowEl.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value, 10);
      paintStars(selectedRating);
    });
    star.addEventListener('mouseenter', () => paintStars(parseInt(star.dataset.value, 10)));
  });
  starRowEl.addEventListener('mouseleave', () => paintStars(selectedRating));
}

document.getElementById('feedbackForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const status = document.getElementById('feedbackStatus');
  const message = document.getElementById('feedbackMessage').value.trim();

  if (!selectedRating) {
    status.textContent = 'Please select a star rating.';
    status.className = 'status-banner show error';
    return;
  }

  try {
    await apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify({ rating: selectedRating, message }),
    });
    status.textContent = 'Thanks for your feedback!';
    status.className = 'status-banner show success';
    this.reset();
    selectedRating = 0;
    document.querySelectorAll('#starRow .star').forEach(s => { s.style.color = 'var(--border)'; });
  } catch (err) {
    status.textContent = err.message;
    status.className = 'status-banner show error';
  }
});
