// home-anim.js — Clean, premium, fast

document.addEventListener("DOMContentLoaded", () => {

  /* =====================
     1. Fade + Slide Reveal
  ====================== */
  const revealEls = document.querySelectorAll(
    "section, .stat-card, .course-card, img, h2, p, .btn"
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-show");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach(el => {
    el.classList.add("reveal-hidden");
    revealObserver.observe(el);
  });


  /* =====================
     2. Stats Counter
  ====================== */
  const counters = document.querySelectorAll(".count");

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || "";
        let current = 0;

        const step = Math.ceil(target / 60);

        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = target + suffix;
            clearInterval(timer);
          } else {
            el.textContent = current + suffix;
          }
        }, 20);

        countObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach(c => countObserver.observe(c));


  /* =====================
     3. Smooth Header Shadow
  ====================== */
  const header = document.getElementById("header");

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 30);
  });

});

//Testimonials JS

document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".testimonial-track");
  const cards = document.querySelectorAll(".testimonial-card");
  let index = 0;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (isMobile) return; // swipe only on mobile

  setInterval(() => {
    index = (index + 1) % cards.length;
    track.style.transform = `translateX(-${index * 340}px)`;
  }, 3000);
});


// Gallery Dots
document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery-preview");
  const images = gallery.querySelectorAll("img");
  const dotsContainer = document.getElementById("galleryDots");
  const prevBtn = document.querySelector(".gallery-btn.left");
  const nextBtn = document.querySelector(".gallery-btn.right");

  let index = 0;

  /* Create dots */
  images.forEach((_, i) => {
    const dot = document.createElement("span");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => scrollToImage(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll("span");

  function updateDots(i) {
    dots.forEach(dot => dot.classList.remove("active"));
    dots[i].classList.add("active");
  }

  function scrollToImage(i) {
    const imgWidth = images[0].clientWidth;
    gallery.scrollTo({
      left: imgWidth * i,
      behavior: "smooth"
    });
    index = i;
    updateDots(index);
  }

  /* Arrow buttons */
  nextBtn.addEventListener("click", () => {
    index = (index + 1) % images.length;
    scrollToImage(index);
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + images.length) % images.length;
    scrollToImage(index);
  });

  /* Update dots on manual scroll */
  gallery.addEventListener("scroll", () => {
    const imgWidth = images[0].clientWidth;
    const newIndex = Math.round(gallery.scrollLeft / imgWidth);
    if (newIndex !== index) {
      index = newIndex;
      updateDots(index);
    }
  });
});
