document.addEventListener('DOMContentLoaded', function() {
    // Update copyright year
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navLinks && navLinks.classList.contains('active') && !event.target.closest('nav')) {
            navLinks.classList.remove('active');
        }
    });

    // Active page indicator
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function(link) {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('nav-active');
        }
    });

    // Add theme toggle button to the body
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(themeToggle);

    // Check for saved theme preference or use device preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'light' || (!currentTheme && !prefersDarkScheme.matches)) {
        // User explicitly chose light, or OS prefers light — stay light
    } else {
        // Default to dark
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Theme toggle functionality
    themeToggle.addEventListener('click', function() {
        let theme = 'light';

        if (document.documentElement.getAttribute('data-theme') !== 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            theme = 'dark';
            this.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.documentElement.removeAttribute('data-theme');
            this.innerHTML = '<i class="fas fa-moon"></i>';
        }

        localStorage.setItem('theme', theme);

        // Reinitialize particles with new colors
        var particlesContainer = document.getElementById('particles-js');
        if (particlesContainer) {
            particlesContainer.innerHTML = '';
            setTimeout(function() {
                initParticles();
            }, 100);
        }
    });

    // Initialize tsParticles
    setTimeout(function() {
        initParticles();
    }, 100);

    // Scroll-triggered reveal animations
    var revealElements = document.querySelectorAll('[data-reveal]');
    if (revealElements.length > 0) {
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
            revealObserver.observe(el);
        });
    }

    // Generate CSRF token for forms
    generateCSRFToken();
});

function initParticles() {
    var particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) return;

    var isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    var particleColor = isDarkTheme ? '#1ABC9C' : '#0F1C2E';
    var lineColor = isDarkTheme ? '#1ABC9C' : '#0F1C2E';

    try {
        tsParticles.load('particles-js', {
            fpsLimit: 60,
            particles: {
                number: {
                    value: 70,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: particleColor
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
                    distance: 120,
                    color: lineColor,
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 0.8,
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
                detectsOn: 'canvas',
                events: {
                    onHover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onClick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        links: {
                            opacity: 0.6
                        }
                    },
                    push: {
                        quantity: 3
                    }
                }
            },
            retina_detect: true
        });
    } catch (error) {
        console.error('Error initializing particles:', error);
    }
}

// Generate CSRF token for form protection
function generateCSRFToken() {
    var forms = document.querySelectorAll('form');

    forms.forEach(function(form) {
        if (form.action && form.action.includes('formsubmit.co')) return;

        var csrfInput = form.querySelector('input[name="_csrf"]');
        if (csrfInput) {
            var token = Math.random().toString(36).substring(2, 15) +
                        Math.random().toString(36).substring(2, 15) +
                        Date.now().toString(36);
            csrfInput.value = token;
            sessionStorage.setItem('csrf_token', token);
        }
    });
}
