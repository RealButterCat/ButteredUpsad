/**
 * World Reactivity
 * Makes the website respond to in-game actions and interactions.
 */

class WorldReactivity {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.websiteEffects = [];
        this.secretUnlocked = false;
        
        // Load state from localStorage
        this.loadState();
        
        // Apply any saved effects immediately
        this.applyStoredEffects();
        
        // Bind methods
        this.handleServerBreak = this.handleServerBreak.bind(this);
        this.handleKeyCollect = this.handleKeyCollect.bind(this);
        
        // Set up event listeners
        document.addEventListener('server-break', this.handleServerBreak);
        document.addEventListener('key-collect', this.handleKeyCollect);
        
        console.log('World Reactivity system initialized');
    }
    
    /**
     * Load reactivity state from localStorage
     */
    loadState() {
        const savedState = localStorage.getItem('butteredUpsad_reactivityState');
        
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.websiteEffects = state.websiteEffects || [];
                this.secretUnlocked = state.secretUnlocked || false;
                
                console.log('Loaded reactivity state:', state);
            } catch (error) {
                console.error('Error loading reactivity state:', error);
                this.websiteEffects = [];
                this.secretUnlocked = false;
            }
        }
    }
    
    /**
     * Save reactivity state to localStorage
     */
    saveState() {
        const state = {
            websiteEffects: this.websiteEffects,
            secretUnlocked: this.secretUnlocked
        };
        
        localStorage.setItem('butteredUpsad_reactivityState', JSON.stringify(state));
        console.log('Saved reactivity state:', state);
    }
    
    /**
     * Apply stored effects to the website
     */
    applyStoredEffects() {
        this.websiteEffects.forEach(effect => {
            this.applyEffect(effect);
        });
        
        // Handle secret section unlocking
        if (this.secretUnlocked) {
            this.unlockSecretSection();
        }
    }
    
    /**
     * Apply a specific effect to the website
     */
    applyEffect(effect) {
        switch (effect.type) {
            case 'colorChange':
                this.applyColorChange(effect.target, effect.value);
                break;
                
            case 'transform':
                this.applyTransform(effect.target, effect.value);
                break;
                
            case 'styleChange':
                this.applyStyleChange(effect.target, effect.property, effect.value);
                break;
                
            default:
                console.log(`Unknown effect type: ${effect.type}`);
        }
    }
    
    /**
     * Handle server block break event
     */
    handleServerBreak(event) {
        console.log('Server block broken!');
        
        // Randomize website colors
        this.randomizeWebsiteColors();
    }
    
    /**
     * Handle key item collection event
     */
    handleKeyCollect(event) {
        console.log('Key collected!');
        
        // Unlock secret section
        this.secretUnlocked = true;
        this.unlockSecretSection();
        this.saveState();
    }
    
    /**
     * Randomize all CSS colors on the website
     */
    randomizeWebsiteColors() {
        // Get all elements
        const elements = document.querySelectorAll('*');
        
        // Keep track of changed elements for saving
        const colorChanges = [];
        
        // For each element, randomize its colors
        elements.forEach((element, index) => {
            // Skip game-related elements
            if (element.closest('#game-container')) return;
            
            // Only affect around 30% of elements to avoid complete chaos
            if (Math.random() > 0.3) return;
            
            // Get the computed style
            const style = window.getComputedStyle(element);
            
            // Check if the element has a background color
            if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                const newColor = this.getRandomColor();
                element.style.backgroundColor = newColor;
                
                // Add to changes list
                colorChanges.push({
                    type: 'colorChange',
                    target: this.getElementSelector(element),
                    property: 'backgroundColor',
                    value: newColor
                });
            }
            
            // Check if the element has a text color
            if (style.color && style.color !== 'rgba(0, 0, 0, 0)') {
                // For text, use lighter colors to ensure readability
                const newColor = this.getRandomReadableColor();
                element.style.color = newColor;
                
                // Add to changes list
                colorChanges.push({
                    type: 'colorChange',
                    target: this.getElementSelector(element),
                    property: 'color',
                    value: newColor
                });
            }
        });
        
        // Save all color changes
        colorChanges.forEach(change => {
            this.addWebsiteEffect(change);
        });
        
        // Add a reset button that appears after the colors change
        this.addResetColorsButton();
    }
    
    /**
     * Add reset colors button to the page
     */
    addResetColorsButton() {
        // Check if button already exists
        if (document.getElementById('reset-colors-button')) return;
        
        const resetButton = document.createElement('button');
        resetButton.id = 'reset-colors-button';
        resetButton.textContent = 'Reset Colors';
        resetButton.style.position = 'fixed';
        resetButton.style.bottom = '20px';
        resetButton.style.right = '20px';
        resetButton.style.zIndex = '1000';
        resetButton.style.backgroundColor = '#e74c3c';
        resetButton.style.color = 'white';
        resetButton.style.border = 'none';
        resetButton.style.padding = '10px 15px';
        resetButton.style.borderRadius = '5px';
        resetButton.style.cursor = 'pointer';
        
        resetButton.addEventListener('click', () => {
            // Remove all color change effects
            this.websiteEffects = this.websiteEffects.filter(effect => 
                effect.type !== 'colorChange');
            
            // Reset all element styles
            document.querySelectorAll('*').forEach(element => {
                element.style.backgroundColor = '';
                element.style.color = '';
            });
            
            // Save state
            this.saveState();
            
            // Remove the reset button
            resetButton.remove();
        });
        
        document.body.appendChild(resetButton);
    }
    
    /**
     * Unlock secret section of the website
     */
    unlockSecretSection() {
        console.log('Unlocking secret section...');
        
        // Check if secret section already exists
        if (document.getElementById('secret-section')) return;
        
        // Create secret section
        const secretSection = document.createElement('section');
        secretSection.id = 'secret-section';
        secretSection.className = 'page-section';
        
        // Add content to secret section
        secretSection.innerHTML = `
            <div class="container">
                <h1 class="secret-title">Secret Area Unlocked!</h1>
                <p>You found the secret section by collecting a key in the game. This area contains special content and features.</p>
                <div class="secret-content">
                    <h2>Developer Notes</h2>
                    <p>ButteredUpsad was created as an experiment in blending websites with game mechanics. The goal was to create a game where anything can be interacted with - no invisible walls or artificial boundaries.</p>
                    <h2>Hidden Commands</h2>
                    <ul>
                        <li><strong>Ctrl+Shift+D</strong> - Toggle debug reset button</li>
                        <li><strong>Ctrl+G</strong> - Toggle game mode</li>
                        <li><strong>TAB</strong> - Show inventory when game is active</li>
                    </ul>
                    <h2>Sandbox Area</h2>
                    <p>This area is safe to experiment with. Try to break things intentionally!</p>
                    <div class="sandbox-elements">
                        <div class="sandbox-block" data-game-health="3">Break me!</div>
                        <div class="sandbox-block" data-game-health="3">Move me!</div>
                        <div class="sandbox-block" data-game-health="3">Change me!</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles for secret section
        const secretStyles = document.createElement('style');
        secretStyles.textContent = `
            #secret-section {
                background-color: #2c3e50;
                color: #ecf0f1;
                padding: 2rem 0;
            }
            
            .secret-title {
                color: #f1c40f;
                text-shadow: 0 0 10px rgba(241, 196, 15, 0.5);
                animation: glow 2s infinite alternate;
            }
            
            @keyframes glow {
                from { text-shadow: 0 0 5px rgba(241, 196, 15, 0.5); }
                to { text-shadow: 0 0 20px rgba(241, 196, 15, 0.8); }
            }
            
            .secret-content {
                background-color: rgba(0, 0, 0, 0.2);
                padding: 20px;
                border-radius: 10px;
                margin-top: 20px;
            }
            
            .sandbox-elements {
                display: flex;
                gap: 20px;
                margin-top: 20px;
            }
            
            .sandbox-block {
                width: 150px;
                height: 150px;
                background-color: #3498db;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .sandbox-block:hover {
                transform: scale(1.05);
            }
        `;
        
        document.head.appendChild(secretStyles);
        
        // Add secret section to main
        const main = document.querySelector('main');
        main.appendChild(secretSection);
        
        // Add secret link to navigation
        const navLinks = document.querySelector('.nav-links');
        const secretLink = document.createElement('li');
        secretLink.innerHTML = '<a href="#secret-section" class="secret-link">Secret</a>';
        secretLink.firstChild.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Hide all sections and show secret section
            document.querySelectorAll('.page-section').forEach(section => {
                section.classList.remove('active');
            });
            
            secretSection.classList.add('active');
        });
        
        navLinks.appendChild(secretLink);
        
        // Apply special style to the new link
        const secretLinkStyle = document.createElement('style');
        secretLinkStyle.textContent = `
            .secret-link {
                color: #f1c40f !important;
                animation: pulse-link 2s infinite alternate;
            }
            
            @keyframes pulse-link {
                from { text-shadow: 0 0 0px rgba(241, 196, 15, 0); }
                to { text-shadow: 0 0 10px rgba(241, 196, 15, 0.8); }
            }
        `;
        
        document.head.appendChild(secretLinkStyle);
    }
    
    /**
     * Add a website effect to the collection and apply it
     */
    addWebsiteEffect(effect) {
        // Check if this effect is already stored
        const existingIndex = this.websiteEffects.findIndex(e => 
            e.type === effect.type && 
            e.target === effect.target && 
            e.property === effect.property
        );
        
        if (existingIndex !== -1) {
            // Update existing effect
            this.websiteEffects[existingIndex] = effect;
        } else {
            // Add new effect
            this.websiteEffects.push(effect);
        }
        
        // Apply the effect
        this.applyEffect(effect);
        
        // Save state
        this.saveState();
    }
    
    /**
     * Apply color change to an element
     */
    applyColorChange(selector, value) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.backgroundColor = value;
        });
    }
    
    /**
     * Apply transform to an element
     */
    applyTransform(selector, value) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.transform = value;
        });
    }
    
    /**
     * Apply generic style change to an element
     */
    applyStyleChange(selector, property, value) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style[property] = value;
        });
    }
    
    /**
     * Generate a random color
     */
    getRandomColor() {
        return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
    }
    
    /**
     * Generate a random readable color (for text)
     */
    getRandomReadableColor() {
        // For text colors, ensure they're dark enough on light backgrounds 
        // or light enough on dark backgrounds
        const isDarkTheme = this.isPageDarkThemed();
        
        if (isDarkTheme) {
            // Light color for dark theme
            return `rgb(${150 + Math.floor(Math.random() * 106)}, ${150 + Math.floor(Math.random() * 106)}, ${150 + Math.floor(Math.random() * 106)})`;
        } else {
            // Dark color for light theme
            return `rgb(${Math.floor(Math.random() * 106)}, ${Math.floor(Math.random() * 106)}, ${Math.floor(Math.random() * 106)})`;
        }
    }
    
    /**
     * Check if the page has a dark theme
     */
    isPageDarkThemed() {
        const bodyStyle = window.getComputedStyle(document.body);
        const bodyColor = bodyStyle.backgroundColor;
        
        // Extract RGB components 
        const rgb = bodyColor.match(/\d+/g);
        
        if (rgb && rgb.length >= 3) {
            const [r, g, b] = rgb.map(Number);
            
            // Calculate relative luminance (simplified)
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            // If luminance is less than 0.5, it's considered dark
            return luminance < 0.5;
        }
        
        return false;
    }
    
    /**
     * Get a CSS selector for an element (simplified)
     */
    getElementSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }
        
        if (element.className && typeof element.className === 'string') {
            const classes = element.className.split(' ').filter(c => c);
            if (classes.length > 0) {
                return `.${classes[0]}`;
            }
        }
        
        // Fallback to tag name
        const tagName = element.tagName.toLowerCase();
        const siblings = Array.from(element.parentNode.children).filter(
            e => e.tagName.toLowerCase() === tagName
        );
        
        if (siblings.length === 1) {
            return tagName;
        }
        
        // If all else fails, use nth-child
        const index = Array.from(element.parentNode.children).indexOf(element) + 1;
        return `${tagName}:nth-child(${index})`;
    }
    
    /**
     * Reset all reactivity effects
     */
    resetAll() {
        // Clear all effects
        this.websiteEffects = [];
        this.secretUnlocked = false;
        
        // Remove secret section if it exists
        const secretSection = document.getElementById('secret-section');
        if (secretSection) {
            secretSection.remove();
        }
        
        // Remove secret link from navigation
        const secretLink = document.querySelector('.secret-link');
        if (secretLink && secretLink.parentNode) {
            secretLink.parentNode.remove();
        }
        
        // Reset all element styles
        document.querySelectorAll('*').forEach(element => {
            element.style.backgroundColor = '';
            element.style.color = '';
            element.style.transform = '';
        });
        
        // Save state
        this.saveState();
        
        console.log('World Reactivity reset');
    }
}
