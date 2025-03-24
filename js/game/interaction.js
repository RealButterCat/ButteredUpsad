/**
 * Interaction Manager
 * Handles user interactions with game objects and the website.
 */

class InteractionManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.container = document.getElementById('game-container');
        this.canvas = document.getElementById('game-canvas');
        
        // State
        this.draggingObject = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.clickedElements = [];
        
        // Bind methods
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleInteractiveElements = this.handleInteractiveElements.bind(this);
    }
    
    /**
     * Initialize event handlers
     */
    initialize() {
        if (!this.container || !this.canvas) return;
        
        // Add event listeners
        this.canvas.addEventListener('click', this.handleClick);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        
        // Initialize interaction with website elements
        this.initializeWebsiteInteractions();
        
        console.log('Interaction manager initialized');
    }
    
    /**
     * Initialize interactions with website elements
     */
    initializeWebsiteInteractions() {
        // Add interactive class to elements that can be affected by the game
        const interactiveSelectors = [
            'h1', 'h2', 'p', 'button', 'input', 'textarea',
            '.blog-post', '.nav-links li', 'form', 'img'
        ];
        
        const websiteElements = document.querySelectorAll(interactiveSelectors.join(','));
        
        websiteElements.forEach(element => {
            // Skip elements that are part of the game
            if (element.closest('#game-container')) return;
            
            // Add game-interactable class for styling
            element.classList.add('game-interactable');
            
            // Add data attribute for interaction type
            const tagName = element.tagName.toLowerCase();
            let interactionType = 'generic';
            
            if (tagName === 'h1' || tagName === 'h2') {
                interactionType = 'header';
            } else if (tagName === 'p') {
                interactionType = 'text';
            } else if (tagName === 'button' || tagName === 'input' || tagName === 'textarea') {
                interactionType = 'control';
            } else if (element.classList.contains('blog-post')) {
                interactionType = 'content';
            } else if (tagName === 'img') {
                interactionType = 'image';
            }
            
            element.dataset.gameInteraction = interactionType;
            
            // Add health property for breakable elements
            element.dataset.gameHealth = '3';
            element.dataset.gameMaxHealth = '3';
        });
    }
    
    /**
     * Handle canvas click
     */
    handleClick(event) {
        // Only process if game is running
        if (!this.gameEngine.isRunning) return;
        
        const x = event.clientX;
        const y = event.clientY;
        
        // Get objects at click position
        if (this.gameEngine.objectManager) {
            const objects = this.gameEngine.objectManager.getObjectsAt(x, y);
            
            // Process click on topmost object
            if (objects.length > 0) {
                const topObject = objects[objects.length - 1];
                topObject.onClick(event);
                return; // Prevent further processing
            }
        }
        
        // Process click on world
        if (this.gameEngine.world) {
            const cell = this.gameEngine.world.getCellAtPixel(x, y);
            if (cell) {
                // Handle cell click
                console.log('Clicked on world cell:', cell);
                // Modify cell based on game state
            }
        }
        
        // Check for website element interaction after game objects
        this.handleWebsiteElementInteraction(event);
    }
    
    /**
     * Handle mouse down for dragging
     */
    handleMouseDown(event) {
        // Only process if game is running
        if (!this.gameEngine.isRunning) return;
        
        const x = event.clientX;
        const y = event.clientY;
        
        // Get objects at mouse position
        if (this.gameEngine.objectManager) {
            const objects = this.gameEngine.objectManager.getObjectsAt(x, y);
            
            // Find first draggable object
            const draggable = objects.find(obj => obj.interactive && !obj.solid);
            
            if (draggable) {
                // Start dragging
                this.draggingObject = draggable;
                this.dragOffsetX = x - draggable.x;
                this.dragOffsetY = y - draggable.y;
                
                // Add visual feedback
                if (draggable.element) {
                    draggable.element.classList.add('dragging');
                }
                
                // Prevent default behavior
                event.preventDefault();
            }
        }
    }
    
    /**
     * Handle mouse move for dragging
     */
    handleMouseMove(event) {
        // Only process if currently dragging
        if (!this.draggingObject) return;
        
        const x = event.clientX;
        const y = event.clientY;
        
        // Update object position
        this.draggingObject.x = x - this.dragOffsetX;
        this.draggingObject.y = y - this.dragOffsetY;
        
        // Keep within bounds
        this.draggingObject.x = Math.max(0, Math.min(window.innerWidth - this.draggingObject.width, this.draggingObject.x));
        this.draggingObject.y = Math.max(0, Math.min(window.innerHeight - this.draggingObject.height, this.draggingObject.y));
        
        // Update DOM element
        if (this.draggingObject.element) {
            this.draggingObject.element.style.left = `${this.draggingObject.x}px`;
            this.draggingObject.element.style.top = `${this.draggingObject.y}px`;
        }
    }
    
    /**
     * Handle mouse up to end dragging
     */
    handleMouseUp(event) {
        // Only process if currently dragging
        if (!this.draggingObject) return;
        
        // Check for drop on another object
        const x = event.clientX;
        const y = event.clientY;
        
        if (this.gameEngine.objectManager) {
            const objects = this.gameEngine.objectManager.getObjectsAt(x, y);
            
            // Find objects that aren't the one being dragged
            const dropTargets = objects.filter(obj => obj.id !== this.draggingObject.id);
            
            if (dropTargets.length > 0) {
                // Use the topmost object as the drop target
                const dropTarget = dropTargets[dropTargets.length - 1];
                
                console.log(`Dropped ${this.draggingObject.type} on ${dropTarget.type}`);
                
                // Handle object combinations
                this.handleObjectCombination(this.draggingObject, dropTarget);
            }
        }
        
        // Remove dragging visual feedback
        if (this.draggingObject.element) {
            this.draggingObject.element.classList.remove('dragging');
        }
        
        // Reset dragging state
        this.draggingObject = null;
    }
    
    /**
     * Handle interaction with website elements
     */
    handleWebsiteElementInteraction(event) {
        // Only if game is active
        if (!this.gameEngine.isRunning) return;
        
        // Get element under cursor (excluding game container)
        let target = document.elementFromPoint(event.clientX, event.clientY);
        
        // Find closest interactable parent
        while (target && !target.classList.contains('game-interactable')) {
            target = target.parentElement;
            
            // Stop if reached game container or document body
            if (!target || target === this.container || target === document.body) {
                return;
            }
        }
        
        // If found an interactable element
        if (target && target.classList.contains('game-interactable')) {
            console.log('Interacting with website element:', target);
            
            // Process based on interaction type
            const interactionType = target.dataset.gameInteraction || 'generic';
            
            switch (interactionType) {
                case 'header':
                    // Change text color randomly
                    target.style.color = this.getRandomColor();
                    break;
                    
                case 'text':
                    // Reduce "health" of text elements when clicked
                    this.damageWebsiteElement(target);
                    break;
                    
                case 'control':
                    // Randomize position slightly
                    const offsetX = (Math.random() - 0.5) * 20;
                    const offsetY = (Math.random() - 0.5) * 20;
                    target.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                    break;
                    
                case 'content':
                    // Toggle visibility
                    target.classList.toggle('game-damaged');
                    break;
                    
                case 'image':
                    // Rotate slightly
                    const angle = (Math.random() - 0.5) * 30;
                    target.style.transform = `rotate(${angle}deg)`;
                    break;
                    
                default:
                    // Generic interaction - just highlight
                    target.classList.add('game-highlight');
                    setTimeout(() => {
                        target.classList.remove('game-highlight');
                    }, 500);
            }
            
            // Add to clicked elements history
            this.clickedElements.push(target);
            
            // Trigger special events if enough elements are affected
            if (this.clickedElements.length >= 5) {
                this.handleInteractiveElements();
            }
        }
    }
    
    /**
     * Damage a website element
     */
    damageWebsiteElement(element) {
        if (!element.dataset.gameHealth) return;
        
        // Reduce health
        let health = parseInt(element.dataset.gameHealth);
        health = Math.max(0, health - 1);
        element.dataset.gameHealth = health.toString();
        
        // Visual effects based on health
        element.classList.remove('game-damaged-1', 'game-damaged-2', 'game-destroyed');
        
        if (health === 0) {
            // Element "destroyed"
            element.classList.add('game-destroyed');
            
            // Special effects based on element type
            if (element.tagName.toLowerCase() === 'p') {
                element.textContent = '[redacted]';
            }
        } else if (health === 1) {
            element.classList.add('game-damaged-2');
        } else {
            element.classList.add('game-damaged-1');
        }
        
        // Add shake effect
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 200);
    }
    
    /**
     * Handle special effects when enough elements are interacted with
     */
    handleInteractiveElements() {
        // Reset counter
        this.clickedElements = [];
        
        // Random website-wide effect
        const effect = Math.floor(Math.random() * 4);
        
        switch (effect) {
            case 0:
                // Invert colors briefly
                document.body.classList.add('game-invert');
                setTimeout(() => {
                    document.body.classList.remove('game-invert');
                }, 2000);
                break;
                
            case 1:
                // Shake everything
                document.body.classList.add('game-shake');
                setTimeout(() => {
                    document.body.classList.remove('game-shake');
                }, 1000);
                break;
                
            case 2:
                // Spawn a random collectible
                if (this.gameEngine.objectManager) {
                    const x = Math.random() * (window.innerWidth - 30);
                    const y = Math.random() * (window.innerHeight - 30);
                    const collectible = new CollectibleObject(x, y, 'bonus');
                    this.gameEngine.objectManager.addObject(collectible);
                }
                break;
                
            case 3:
                // Change page background
                document.body.style.backgroundColor = this.getRandomLightColor();
                setTimeout(() => {
                    document.body.style.backgroundColor = '';
                }, 3000);
                break;
        }
    }
    
    /**
     * Handle object combinations when one is dropped on another
     */
    handleObjectCombination(sourceObj, targetObj) {
        if (!sourceObj || !targetObj) return;
        
        console.log(`Combining ${sourceObj.type} with ${targetObj.type}`);
        
        // Different combinations based on object types
        const combo = `${sourceObj.type}_${targetObj.type}`;
        
        switch (combo) {
            case 'collectible_npc':
                // Give collectible to NPC
                sourceObj.destroy();
                
                // Show special dialog
                if (this.gameEngine.dialogManager) {
                    const specialDialog = {
                        text: "Thanks for the gift! Here's something in return.",
                        options: [
                            { text: "You're welcome!", responseIndex: -1 }
                        ]
                    };
                    
                    this.gameEngine.dialogManager.showCustomDialog(targetObj, specialDialog);
                }
                
                // Spawn a better collectible
                if (this.gameEngine.objectManager) {
                    const x = targetObj.x + targetObj.width + 10;
                    const y = targetObj.y;
                    const newCollectible = new CollectibleObject(x, y, 'special');
                    newCollectible.value = 5;
                    this.gameEngine.objectManager.addObject(newCollectible);
                }
                break;
                
            case 'collectible_collectible':
                // Combine collectibles to make a more valuable one
                sourceObj.destroy();
                targetObj.value += sourceObj.value;
                
                // Visual indication of upgraded collectible
                if (targetObj.element) {
                    targetObj.element.classList.add('upgraded');
                    setTimeout(() => {
                        targetObj.element.classList.remove('upgraded');
                    }, 1000);
                }
                break;
                
            case 'collectible_wall':
                // Collectible breaks wall
                sourceObj.destroy();
                targetObj.takeDamage(1);
                break;
                
            default:
                // Generic interaction - source takes damage
                sourceObj.takeDamage(1);
        }
    }
    
    /**
     * Generate a random color
     */
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    /**
     * Generate a random light color (for backgrounds)
     */
    getRandomLightColor() {
        const r = 200 + Math.floor(Math.random() * 55);
        const g = 200 + Math.floor(Math.random() * 55);
        const b = 200 + Math.floor(Math.random() * 55);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    /**
     * Clean up event listeners
     */
    cleanup() {
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.handleClick);
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        }
        
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }
}
