/**
 * Controls Helper
 * Provides a subtle keyboard controls reference that can be toggled on/off.
 */

class KeyboardControls {
    constructor() {
        // State
        this.isVisible = false;
        this.element = null;
        this.panel = null;
        
        // Controls configuration
        this.controls = [
            { key: 'WASD / Arrows', description: 'Move player' },
            { key: 'Tab', description: 'Toggle inventory' },
            { key: 'Ctrl+G', description: 'Toggle game mode' },
            { key: 'Click', description: 'Interact with objects' },
            { key: 'Mouse drag', description: 'Move objects' }
        ];
        
        // Bind methods
        this.togglePanel = this.togglePanel.bind(this);
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize controls helper
     */
    initialize() {
        // Create icon element
        this.element = document.createElement('div');
        this.element.id = 'keyboard-controls';
        this.element.innerHTML = '<span>?</span>';
        this.element.title = 'Keyboard Controls';
        
        // Create panel element
        this.panel = document.createElement('div');
        this.panel.id = 'keyboard-controls-panel';
        this.panel.className = 'hidden';
        this.panel.innerHTML = `
            <h4>Keyboard Controls</h4>
            <ul>${this.controls.map(control => `
                <li>
                    <span>${control.description}</span>
                    <kbd>${control.key}</kbd>
                </li>
            `).join('')}</ul>
        `;
        
        // Add click handler
        this.element.addEventListener('click', this.togglePanel);
        
        // Add to DOM (hide initially)
        this.element.style.display = 'none';
        document.body.appendChild(this.element);
        document.body.appendChild(this.panel);
        
        // Hide panel when clicking outside
        document.addEventListener('click', (event) => {
            if (this.isVisible && !this.panel.contains(event.target) && event.target !== this.element) {
                this.hidePanel();
            }
        });
    }
    
    /**
     * Show the controls helper icon
     */
    show() {
        this.element.style.display = 'block';
    }
    
    /**
     * Hide the controls helper icon
     */
    hide() {
        this.element.style.display = 'none';
        this.hidePanel();
    }
    
    /**
     * Toggle the controls panel
     */
    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }
    
    /**
     * Show the controls panel
     */
    showPanel() {
        this.panel.classList.add('visible');
        this.isVisible = true;
    }
    
    /**
     * Hide the controls panel
     */
    hidePanel() {
        this.panel.classList.remove('visible');
        this.isVisible = false;
    }
}
