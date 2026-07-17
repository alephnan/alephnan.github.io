document.addEventListener('DOMContentLoaded', function() {
    // Update copyright year
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    function closeNav() {
        if (!navLinks || !navLinks.classList.contains('active')) return;
        navLinks.classList.remove('active');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            const isOpen = navLinks.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    // Close mobile menu when clicking outside or pressing Escape
    document.addEventListener('click', function(event) {
        if (navLinks && navLinks.classList.contains('active') && !event.target.closest('.site-header')) {
            closeNav();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') closeNav();
    });

    // Active page indicator (fallback for hardcoded aria-current)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function(link) {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('nav-active');
        }
    });

    // Live UTC clock (index hero)
    const clockEl = document.querySelector('[data-utc-clock]');
    if (clockEl) {
        function tickClock() {
            clockEl.textContent = new Date().toISOString().slice(11, 19);
        }
        tickClock();
        setInterval(tickClock, 1000);
    }

    // Initialize tsParticles
    setTimeout(function() {
        initParticles();
    }, 100);

    // Scroll-triggered reveal animations
    var revealElements = document.querySelectorAll('[data-reveal]');
    if (revealElements.length > 0) {
        var initialRevealOffset = 120;

        function shouldRevealImmediately(element) {
            var rect = element.getBoundingClientRect();
            return rect.top <= (window.innerHeight + initialRevealOffset);
        }

        var revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var delay = entry.target.dataset.revealDelay || 0;
                    setTimeout(function() {
                        entry.target.classList.add('revealed');
                    }, parseInt(delay));
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(function(el) {
            if (shouldRevealImmediately(el)) {
                el.classList.add('revealed');
                return;
            }

            revealObserver.observe(el);
        });
    }
});

function initParticles() {
    var particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var accent = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent').trim() || '#1ABC9C';

    try {
        tsParticles.load('particles-js', {
            fpsLimit: 60,
            particles: {
                number: {
                    value: 123,
                    density: {
                        enable: true,
                        value_area: 700
                    }
                },
                color: {
                    value: accent
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: { min: 0.1, max: 0.5 },
                    animation: {
                        enable: true,
                        speed: 0.5,
                        minimumValue: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: { min: 0.5, max: 2.5 },
                    animation: {
                        enable: false
                    }
                },
                links: {
                    enable: true,
                    distance: 130,
                    color: accent,
                    opacity: 0.1,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 0.7,
                    direction: 'none',
                    random: true,
                    straight: false,
                    outModes: {
                        default: 'out'
                    },
                    bounce: false
                }
            },
            interactivity: {
                detectsOn: 'window',
                events: {
                    onHover: {
                        enable: true,
                        mode: 'grab'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        links: {
                            opacity: 0.5
                        }
                    }
                }
            },
            retina_detect: true
        });
    } catch (error) {
        console.error('Error initializing particles:', error);
    }
}
