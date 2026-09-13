/* ============================================================
   MEDLINK - script.js
   General page interactions for the landing page:
     1. Navbar shadow/background when the page is scrolled
     2. Mobile hamburger menu open/close
     3. FAQ accordion open/close
   Scroll-reveal and counter animations live in animation.js
   so each file has one clear job.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. NAVBAR SCROLL EFFECT ----------
     Once the user scrolls past 20px, add a "scrolled" class
     that gives the navbar a background and shadow (see
     .navbar.scrolled in style.css). */
  var navbar = document.querySelector('.navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  if (navbar) {
    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll(); // run once on load in case the page opens mid-scroll
  }

  /* ---------- 2. MOBILE MENU TOGGLE ----------
     Clicking the hamburger button shows/hides the nav links
     and flips the hamburger icon into an "X" (handled by the
     .open class in responsive.css). */
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // close the menu automatically when a link is tapped
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ---------- 3. FAQ ACCORDION ----------
     Only one answer is open at a time. Clicking an already-open
     question closes it again. */
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');

    question.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');

      // close every other item first
      faqItems.forEach(function (otherItem) {
        otherItem.classList.remove('open');
      });

      // then reopen this one, unless it was the one just closed
      if (!wasOpen) {
        item.classList.add('open');
      }
    });
  });

});
