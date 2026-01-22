document.addEventListener('DOMContentLoaded', () => {
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	const navToggle = document.getElementById('navToggle');
	const navLinks = document.getElementById('navLinks');
	if (navToggle && navLinks) {
		navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
		navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
		document.addEventListener('click', (e) => {
			if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) navLinks.classList.remove('open');
		});
	}


  // Convert English number to Marathi digits
  function toMarathiNumber(num) {
    const marathiDigits = ['०','१','२','३','४','५','६','७','८','९'];
    return num.toString().replace(/\d/g, d => marathiDigits[d]);
  }

  const counters = document.querySelectorAll(".count");

  counters.forEach(counter => {
    const target = +counter.dataset.target;
    const suffix = counter.dataset.suffix || "";
    let current = 0;

    const increment = target / 100; // speed control

    const updateCounter = () => {
      if (current < target) {
        current += increment;
        counter.innerText =
          toMarathiNumber(Math.floor(current)) + suffix;
        requestAnimationFrame(updateCounter);
      } else {
        counter.innerText =
          toMarathiNumber(target) + suffix;
      }
    };

    updateCounter();
  });



	// Auto-build and loop the red tape (ticker)
	const buildTape = () => {
		const tracks = document.querySelectorAll('.tape-track[data-auto]');
		tracks.forEach(track => {
			// If already built, skip
			if (track.dataset.built === 'true') return;
			const parent = track.parentElement;
			if (!parent) return;
			const baseText = (track.textContent || 'Success 100% Guarantee').trim();
			track.innerHTML = '';
			// Create an item factory
			const makeItem = () => {
				const span = document.createElement('span');
				span.className = 'tape-item';
				span.textContent = baseText;
				return span;
			};
			// Fill at least twice the container width for seamless loop
			const targetWidth = (parent.offsetWidth || window.innerWidth) * 2;
			let total = 0;
			while (total < targetWidth) {
				const el = makeItem();
				track.appendChild(el);
				total = track.scrollWidth;
			}
			track.dataset.built = 'true';
		});
	};
	buildTape();
	window.addEventListener('resize', () => {
		// Rebuild after resize for correct density
		document.querySelectorAll('.tape-track[data-auto]').forEach(t => {
			t.dataset.built = 'false';
		});
		buildTape();
	});
});

// js for img gallery popup
const modal = document.getElementById("img-modal");
  const modalImg = document.getElementById("modal-img");
  const captionText = document.getElementById("caption");
  const closeBtn = document.querySelector(".img-modal .close");

  // Select all gallery images
  const galleryImages = document.querySelectorAll(".gallery-preview img");

  galleryImages.forEach(img => {
    img.addEventListener("click", () => {
      modal.style.display = "block";       // Show modal
      modalImg.src = img.src;              // Full-size image
      captionText.textContent = img.alt;   // Caption from alt
    });
  });

  // Close modal on clicking ×
  closeBtn.onclick = function() {
    modal.style.display = "none";
  }

  // Close modal when clicking outside image
  modal.onclick = function(e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  }
