/**
 * UI Manager
 * Handles game UI elements, transitions, and feedback.
 * Focuses on making the game feel like a normal website until activated.
 */

class UIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.container = document.getElementById('game-container');
        
        // UI state
        this.isTooltipVisible = false;
        this.tooltips = {};
        this.uiElements = {};
        this.activeAnimations = [];
        
        // Subtle animation timers
        this.hoverEffects = [];
        this.ambientAnimationTimer = null;
        
        // Bind methods
        this.showGameTooltip = this.showGameTooltip.bind(this);
        this.hideGameTooltip = this.hideGameTooltip.bind(this);
        this.showNotification = this.showNotification.bind(this);
        this.saveGamePreferences = this.saveGamePreferences.bind(this);
        this.loadGamePreferences = this.loadGamePreferences.bind(this);
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize UI elements and event listeners
     */
    initialize() {
        console.log('Initializing UI manager');
        
        // Create game mode indicator (hidden by default)
        this.createGameModeIndicator();
        
        // Add subtle hover effects to various elements
        this.setupHoverEffects();
        
        // Add tooltip for Ctrl+G keyboard shortcut
        const startGameButton = document.getElementById('start-game');
        if (startGameButton) {
            startGameButton.setAttribute('title', 'Press Ctrl+G to toggle game mode');
            
            // Add a subtle pulse animation to hint at the game feature
            startGameButton.classList.add('pulse-hint');
        }
        
        // Load user preferences
        this.loadGamePreferences();
    }
    
    /**
     * Create a subtle game mode indicator
     */
    createGameModeIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'game-mode-indicator';
        indicator.className = 'hidden';
        indicator.innerHTML = '<div class="indicator-dot"></div><span>Game Mode</span>';
        
        // Add to DOM
        document.body.appendChild(indicator);
        
        // Store reference
        this.uiElements.gameModeIndicator = indicator;
    }
    
    /**
     * Add subtle hover animations to various elements
     */
    setupHoverEffects() {
        // Add hover effects to nav links
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                if (!this.gameEngine || !this.gameEngine.isRunning) return;
                this.addHoverEffect(link, 'color-shift');
            });
        });
        
        // Add hover effects to buttons
        const buttons = document.querySelectorAll('button:not(#start-game)');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (!this.gameEngine || !this.gameEngine.isRunning) return;
                this.addHoverEffect(button, 'scale');
            });
        });
    }
    
    /**
     * Add a subtle hover effect to an element
     */
    addHoverEffect(element, effectType) {
        if (!element) return;
        
        switch (effectType) {
            case 'color-shift':
                const originalColor = window.getComputedStyle(element).color;
                element.style.transition = 'color 0.3s';
                element.style.color = '#3498db';
                
                // Reset after mouse leaves
                element.addEventListener('mouseleave', () => {
                    element.style.color = originalColor;
                }, { once: true });
                break;
                
            case 'scale':
                element.style.transition = 'transform 0.2s';
                element.style.transform = 'scale(1.05)';
                
                // Reset after mouse leaves
                element.addEventListener('mouseleave', () => {
                    element.style.transform = '';
                }, { once: true });
                break;
                
            case 'glow':
                const originalBoxShadow = window.getComputedStyle(element).boxShadow;
                element.style.transition = 'box-shadow 0.3s';
                element.style.boxShadow = '0 0 8px rgba(52, 152, 219, 0.5)';
                
                // Reset after mouse leaves
                element.addEventListener('mouseleave', () => {
                    element.style.boxShadow = originalBoxShadow;
                }, { once: true });
                break;
        }
        
        // Track active hover effects
        this.hoverEffects.push({
            element,
            effectType
        });
    }
    
    /**
     * Show a temporary tooltip for game controls
     */
    showGameTooltip(id, position, content, duration = 3000) {
        // Close any existing tooltip with the same ID
        if (this.tooltips[id]) {
            this.hideGameTooltip(id);
        }
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'game-tooltip';
        tooltip.innerHTML = content;
        
        // Apply position
        if (position.top) tooltip.style.top = `${position.top}px`;
        if (position.bottom) tooltip.style.bottom = `${position.bottom}px`;
        if (position.left) tooltip.style.left = `${position.left}px`;
        if (position.right) tooltip.style.right = `${position.right}px`;
        
        // Add to DOM
        document.body.appendChild(tooltip);
        
        // Fade in
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
        
        // Save reference
        this.tooltips[id] = tooltip;
        
        // Auto-hide after duration (if not 0)
        if (duration > 0) {
            setTimeout(() => {
                this.hideGameTooltip(id);
            }, duration);
        }
        
        return tooltip;
    }
    
    /**
     * Hide a game tooltip by ID
     */
    hideGameTooltip(id) {
        const tooltip = this.tooltips[id];
        if (!tooltip) return;
        
        // Fade out
        tooltip.style.opacity = '0';
        
        // Remove after animation
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
            delete this.tooltips[id];
        }, 300);
    }
    
    /**
     * Show a temporary notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `game-notification ${type}`;
        notification.textContent = message;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Auto-hide after duration
        setTimeout(() => {
            notification.style.transform = 'translateY(-10px)';
            notification.style.opacity = '0';
            
            // Remove after animation
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        return notification;
    }
    
    /**
     * Add subtle ambient animations to the website when game is active
     */
    startAmbientAnimations() {
        // Cancel any existing timer
        if (this.ambientAnimationTimer) {
            clearInterval(this.ambientAnimationTimer);
        }
        
        // Add subtle animations every 10-30 seconds
        this.ambientAnimationTimer = setInterval(() => {
            // Only run if game is active
            if (!this.gameEngine || !this.gameEngine.isRunning) return;
            
            // Pick a random effect
            const effectType = Math.floor(Math.random() * 3);
            
            switch (effectType) {
                case 0:
                    // Slight page tilt
                    document.body.style.transition = 'transform 3s';
                    const angle = (Math.random() * 0.3) - 0.15; // -0.15 to 0.15 degrees
                    document.body.style.transform = `rotate(${angle}deg)`;
                    
                    // Reset after 3 seconds
                    setTimeout(() => {
                        document.body.style.transform = '';
                    }, 3000);
                    break;
                    
                case 1:
                    // Subtle color shift in background
                    document.body.style.transition = 'background-color 3s';
                    const hue = Math.floor(Math.random() * 360);
                    document.body.style.backgroundColor = `hsla(${hue}, 10%, 98%, 0.5)`;
                    
                    // Reset after 3 seconds
                    setTimeout(() => {
                        document.body.style.backgroundColor = '';
                    }, 3000);
                    break;
                    
                case 2:
                    // Make a random heading "breathe"
                    const headings = document.querySelectorAll('h1, h2');
                    if (headings.length > 0) {
                        const heading = headings[Math.floor(Math.random() * headings.length)];
                        heading.style.transition = 'transform 1.5s ease-in-out';
                        heading.style.transformOrigin = 'center';
                        heading.style.animation = 'heading-breathe 3s ease-in-out';
                        
                        // Clean up after animation
                        setTimeout(() => {
                            heading.style.animation = '';
                        }, 3000);
                    }
                    break;
            }
        }, 15000 + Math.random() * 15000); // 15-30 second interval
    }
    
    /**
     * Stop ambient animations
     */
    stopAmbientAnimations() {
        if (this.ambientAnimationTimer) {
            clearInterval(this.ambientAnimationTimer);
            this.ambientAnimationTimer = null;
        }
        
        // Reset any active animations
        document.body.style.transform = '';
        document.body.style.backgroundColor = '';
    }
    
    /**
     * Show game mode indicator
     */
    showGameModeIndicator() {
        if (this.uiElements.gameModeIndicator) {
            this.uiElements.gameModeIndicator.classList.remove('hidden');
        }
    }
    
    /**
     * Hide game mode indicator
     */
    hideGameModeIndicator() {
        if (this.uiElements.gameModeIndicator) {
            this.uiElements.gameModeIndicator.classList.add('hidden');
        }
    }
    
    /**
     * Transition website to game mode
     */
    transitionToGameMode() {
        // Show game mode indicator
        this.showGameModeIndicator();
        
        // Add subtle game mode class to body
        document.body.classList.add('game-mode');
        
        // Start ambient animations
        this.startAmbientAnimations();
        
        // Show welcome tooltip if first time
        const hasSeenWelcome = localStorage.getItem('butteredUpsad_seenWelcome');
        if (!hasSeenWelcome) {
            // Show welcome message with game info
            this.showGameTooltip('welcome', { top: 100, right: 20 }, `
                <h4>Welcome to Game Mode!</h4>
                <p>You can now interact with any element on this website.</p>
                <ul>
                    <li>Click elements to attack them</li>
                    <li>Drag objects to move them</li>
                    <li>Explore and discover secrets</li>
                </ul>
                <p><small>Press Ctrl+G to exit game mode anytime</small></p>
            `, 8000);
            
            // Mark as seen
            localStorage.setItem('butteredUpsad_seenWelcome', 'true');
        }
    }
    
    /**
     * Transition back to normal website mode
     */
    transitionToNormalMode() {
        // Hide game mode indicator
        this.hideGameModeIndicator();
        
        // Remove game mode class from body
        document.body.classList.remove('game-mode');
        
        // Stop ambient animations
        this.stopAmbientAnimations();
        
        // Hide all tooltips
        Object.keys(this.tooltips).forEach(id => {
            this.hideGameTooltip(id);
        });
        
        // Reset any game-specific styles
        document.body.style.transform = '';
        document.body.style.backgroundColor = '';
    }
    
    /**
     * Save game preferences to localStorage
     */
    saveGamePreferences() {
        const preferences = {
            uiScale: 1, // Default scale
            tooltipsEnabled: true,
            ambientAnimationsEnabled: true,
            lastVisit: new Date().toISOString()
        };
        
        localStorage.setItem('butteredUpsad_preferences', JSON.stringify(preferences));
    }
    
    /**
     * Load game preferences from localStorage
     */
    loadGamePreferences() {
        const savedPrefs = localStorage.getItem('butteredUpsad_preferences');
        
        if (savedPrefs) {
            try {
                const preferences = JSON.parse(savedPrefs);
                // Apply loaded preferences
                // (Future: could apply UI scaling, toggle features, etc.)
                
                // Check if it's been more than a week since last visit
                if (preferences.lastVisit) {
                    const lastVisit = new Date(preferences.lastVisit);
                    const now = new Date();
                    const daysSinceLastVisit = (now - lastVisit) / (1000 * 60 * 60 * 24);
                    
                    if (daysSinceLastVisit > 7) {
                        // If returning after a while, show welcome back message
                        setTimeout(() => {
                            this.showNotification('Welcome back! Press Ctrl+G to activate game mode.', 'info', 5000);
                        }, 3000);
                    }
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
            }
        } else {
            // First visit, save default preferences
            this.saveGamePreferences();
        }
    }
    
    /**
     * Clean up UI elements and timers
     */
    cleanup() {
        // Stop ambient animations
        this.stopAmbientAnimations();
        
        // Hide all tooltips
        Object.keys(this.tooltips).forEach(id => {
            this.hideGameTooltip(id);
        });
        
        // Save preferences
        this.saveGamePreferences();
    }
}
