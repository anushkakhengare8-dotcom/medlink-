/* ============================================================
   MEDLINK - animation.js
   Handles the two "on scroll" effects used across the landing
   page:
     1. Fade-in-up reveal for sections (elements with class "reveal")
     2. Counting-up numbers for the hero/analytics stats
   Both use IntersectionObserver, which only fires when an
   element actually enters the viewport - much cheaper than
   checking scroll position by hand.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. FADE-IN-UP SCROLL REVEAL ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  var revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // only needs to happen once
      }
    });
  }, {
    threshold: 0.15 // fire once 15% of the element is visible
  });

  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- 2. COUNTER ANIMATION ----------
     Any element with class "counter" and a data-target attribute
     (e.g. data-target="12000") counts up from 0 to that number
     once it scrolls into view. */
  var counterEls = document.querySelectorAll('.counter');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400; // total animation time in milliseconds
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var current = Math.floor(progress * target);
      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString() + suffix; // avoid rounding drift at the end
      }
    }

    requestAnimationFrame(step);
  }

  var counterObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });

  counterEls.forEach(function (el) {
    counterObserver.observe(el);
  });

});
