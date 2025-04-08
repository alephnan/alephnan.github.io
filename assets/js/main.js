document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Check initial theme
    const initialTheme = document.documentElement.getAttribute('data-theme');
    console.log('Initial theme:', initialTheme || 'light (default)');
    
    // Update copyright year
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
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
    
    // Add theme toggle button to the body
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(themeToggle);
    
    // Check for saved theme preference or use device preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
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
        console.log('Theme switched to:', theme);
        
        // Reinitialize particles with new colors
        const particlesContainer = document.getElementById('particles-js');
        if (particlesContainer) {
            // Clear existing particles
            particlesContainer.innerHTML = '';
            // Reinitialize with new colors
            setTimeout(() => {
                initParticles();
            }, 100);
        }
    });
    
    // Initialize tsParticles
    setTimeout(() => {
        initParticles();
    }, 100); // Small delay to ensure DOM is fully loaded
    
    // Generate CSRF token for forms
    generateCSRFToken();
});

function initParticles() {
    // Check if we're on a page with particles container
    const particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) {
        console.log('No particles container found');
        return;
    }
    
    console.log('Initializing particles...');
    
    // Get current theme
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    const particleColor = isDarkTheme ? "#E5E5E5" : "#0F1C2E";
    
    try {
        tsParticles.load("particles-js", {
            fpsLimit: 60,
            particles: {
                number: {
                    value: 50,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: particleColor
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    },
                    polygon: {
                        nb_sides: 5
                    }
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: particleColor,
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        }).then(() => {
            console.log('Particles initialized successfully');
        }).catch(error => {
            console.error('Error initializing particles:', error);
        });
    } catch (error) {
        console.error('Error in tsParticles initialization:', error);
    }
}

function updateParticlesColor(theme) {
    const container = document.getElementById('particles-js');
    if (!container || !window.pJSDom || !window.pJSDom.length) return;
    
    const particlesJS = window.pJSDom[0].pJS;
    if (!particlesJS) return;
    
    const newColor = theme === 'dark' ? "#E5E5E5" : "#0F1C2E";
    
    // Update particle colors
    for (let i = 0; i < particlesJS.particles.array.length; i++) {
        particlesJS.particles.array[i].color.value = newColor;
        particlesJS.particles.array[i].color.rgb = hexToRgb(newColor);
    }
    
    // Update line linked color
    particlesJS.particles.line_linked.color = newColor;
    particlesJS.particles.line_linked.color_rgb_line = hexToRgb(newColor);
    
    // Force redraw
    particlesJS.fn.particlesRefresh();
}

function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

// Generate CSRF token for form protection
function generateCSRFToken() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Skip FormSubmit forms
        if (form.action && form.action.includes('formsubmit.co')) {
            return;
        }
        
        const csrfInput = form.querySelector('input[name="_csrf"]');
        if (csrfInput) {
            // Generate a random token
            const token = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15) +
                          Date.now().toString(36);
            
            // Set the token value
            csrfInput.value = token;
            
            // Store in sessionStorage for validation if needed
            sessionStorage.setItem('csrf_token', token);
        }
    });
} 