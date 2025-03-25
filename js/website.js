/**
 * Website functionality (navigation, form handling, etc.)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Only process links with hash
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                // Get the target section ID
                const targetId = link.getAttribute('href');
                
                // Hide all sections and show target
                const sections = document.querySelectorAll('.page-section');
                sections.forEach(section => {
                    section.classList.remove('active');
                });
                
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            }
        });
    });
    
    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // In a real application, you would send the form data to a server
            // For this demo, we'll just show a success message
            const formData = new FormData(contactForm);
            const formValues = {};
            
            for (const [key, value] of formData.entries()) {
                formValues[key] = value;
            }
            
            console.log('Form submitted:', formValues);
            
            // Reset form and show success message
            contactForm.reset();
            
            // Create success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Message sent! We\'ll get back to you soon.';
            successMessage.style.backgroundColor = '#2ecc71';
            successMessage.style.color = 'white';
            successMessage.style.padding = '10px';
            successMessage.style.borderRadius = '4px';
            successMessage.style.marginTop = '10px';
            
            // Insert after form
            contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);
            
            // Remove after 3 seconds
            setTimeout(() => {
                successMessage.style.opacity = '0';
                successMessage.style.transition = 'opacity 0.5s';
                
                setTimeout(() => {
                    if (successMessage.parentNode) {
                        successMessage.parentNode.removeChild(successMessage);
                    }
                }, 500);
            }, 3000);
        });
    }
    
    // Mobile navigation toggle (for responsive design)
    // This would be expanded in a real project with responsive styles
    const createMobileNavToggle = () => {
        const nav = document.querySelector('nav');
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-nav-toggle';
        mobileToggle.innerHTML = '☰';
        
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('mobile-nav-open');
        });
        
        nav.prepend(mobileToggle);
    };
    
    // Only create mobile nav for smaller screens
    if (window.innerWidth < 768) {
        createMobileNavToggle();
    }
    
    // Add animations to hero section
    animateHeroSection();
    
    // Add some simple animations to page elements
    animatePageElements();
    
    // Add a subtle hint about the game mode
    setTimeout(addGameHint, 3000);
});

/**
 * Animate the hero section
 */
function animateHeroSection() {
    const heroSection = document.querySelector('.hero-section');
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const heroButton = document.querySelector('.hero-cta');
    
    if (!heroSection || !heroTitle || !heroDescription || !heroButton) return;
    
    // Set initial states
    heroTitle.style.opacity = '0';
    heroTitle.style.transform = 'translateY(-20px)';
    heroTitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    
    heroDescription.style.opacity = '0';
    heroDescription.style.transform = 'translateY(-10px)';
    heroDescription.style.transition = 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s';
    
    heroButton.style.opacity = '0';
    heroButton.style.transform = 'scale(0.9)';
    heroButton.style.transition = 'opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s';
    
    // Trigger animations after a short delay
    setTimeout(() => {
        heroTitle.style.opacity = '1';
        heroTitle.style.transform = 'translateY(0)';
        
        heroDescription.style.opacity = '1';
        heroDescription.style.transform = 'translateY(0)';
        
        heroButton.style.opacity = '1';
        heroButton.style.transform = 'scale(1)';
    }, 100);
    
    // Add subtle background animation
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        heroBg.style.transition = 'opacity 2s ease-in-out';
        
        // Subtle pulse animation for the background
        setInterval(() => {
            heroBg.style.opacity = (parseFloat(getComputedStyle(heroBg).opacity) === 0.1) ? '0.15' : '0.1';
        }, 4000);
    }
}

/**
 * Animate page elements
 */
function animatePageElements() {
    const elements = document.querySelectorAll('h1:not(.hero-title), h2, .blog-post');
    
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Stagger animations
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}

/**
 * Add a subtle hint that encourages users to discover game mode
 */
function addGameHint() {
    // Check if this is the first visit (don't show hint if they've already seen it)
    if (localStorage.getItem('butteredUpsad_hintShown')) {
        return;
    }
    
    // Create a subtle hint element
    const hintElement = document.createElement('div');
    hintElement.className = 'game-hint';
    hintElement.innerHTML = `
        <div class="hint-content">
            <p>Psst! Try pressing <kbd>Ctrl</kbd>+<kbd>G</kbd> or click "Start Adventure" to begin!</p>
            <button class="hint-close">×</button>
        </div>
    `;
    
    // Style the hint
    const hintStyles = `
        .game-hint {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: rgba(44, 62, 80, 0.9);
            color: white;
            padding: 12px;
            border-radius: 5px;
            max-width: 250px;
            font-size: 13px;
            z-index: 1000;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.5s, transform 0.5s;
        }
        
        .hint-content {
            display: flex;
            align-items: center;
        }
        
        .hint-content p {
            margin: 0;
            flex: 1;
            line-height: 1.4;
        }
        
        .hint-close {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            font-size: 18px;
            cursor: pointer;
            padding: 0 0 0 10px;
        }
        
        .hint-close:hover {
            color: white;
        }
        
        .game-hint kbd {
            display: inline-block;
            padding: 2px 4px;
            font-family: monospace;
            font-size: 11px;
            color: #f9f9f9;
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            margin: 0 2px;
        }
    `;
    
    // Add styles
    const styleElement = document.createElement('style');
    styleElement.textContent = hintStyles;
    document.head.appendChild(styleElement);
    
    // Add hint to the document
    document.body.appendChild(hintElement);
    
    // Animate in after a brief delay
    setTimeout(() => {
        hintElement.style.opacity = '1';
        hintElement.style.transform = 'translateY(0)';
    }, 500);
    
    // Add close button handler
    const closeButton = hintElement.querySelector('.hint-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            hintElement.style.opacity = '0';
            hintElement.style.transform = 'translateY(10px)';
            
            // Remove after animation
            setTimeout(() => {
                if (hintElement.parentNode) {
                    hintElement.parentNode.removeChild(hintElement);
                }
            }, 500);
            
            // Mark as shown so it won't appear again
            localStorage.setItem('butteredUpsad_hintShown', 'true');
        });
    }
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
        if (hintElement.parentNode) {
            hintElement.style.opacity = '0';
            hintElement.style.transform = 'translateY(10px)';
            
            // Remove after animation
            setTimeout(() => {
                if (hintElement.parentNode) {
                    hintElement.parentNode.removeChild(hintElement);
                }
            }, 500);
        }
    }, 8000);
    
    // Mark as shown
    localStorage.setItem('butteredUpsad_hintShown', 'true');
}
