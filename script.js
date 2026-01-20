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

	const header = document.getElementById('header');
	const onScroll = () => {
		if (!header) return;
		if (window.scrollY > 8) header.classList.add('scrolled');
		else header.classList.remove('scrolled');
	};
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });

		const counts = document.querySelectorAll('.count');
		if (counts.length) {
			const format = new Intl.NumberFormat('en-IN');
			const animate = (el) => {
				if (el.dataset.animated === 'true') return;
				const target = parseFloat(el.dataset.target || '0');
				const suffix = el.dataset.suffix || '';
				const duration = parseInt(el.dataset.duration || '1200', 10);
				let startTime = null;
				const step = (ts) => {
					if (!startTime) startTime = ts;
					const p = Math.min((ts - startTime) / duration, 1);
					const current = Math.floor(p * target);
					el.textContent = format.format(current) + suffix;
					if (p < 1) requestAnimationFrame(step);
					else el.dataset.animated = 'true';
				};
				requestAnimationFrame(step);
			};

			const grid = document.querySelector('.stats-grid');
			if ('IntersectionObserver' in window && grid) {
				const io = new IntersectionObserver((entries, obs) => {
					entries.forEach(e => {
						if (e.isIntersecting) {
							counts.forEach(animate);
							obs.disconnect();
						}
					});
				}, { threshold: 0.3 });
				io.observe(grid);
			} else {
				counts.forEach(animate);
			}
		}

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

