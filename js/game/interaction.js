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
        
        // DOM Element dragging state
        this.draggingElement = null;
        this.elementDragOffsetX = 0;
        this.elementDragOffsetY = 0;
        
        // World state for persistence
        this.worldState = this.loadWorldState() || {
            brokenElements: [],
            movedElements: {}
        };
        
        // Bind methods
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleInteractiveElements = this.handleInteractiveElements.bind(this);
        this.handleElementMouseDown = this.handleElementMouseDown.bind(this);
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
        
        // Restore broken/moved elements from world state
        this.restoreWorldState();
        
        console.log('Interaction manager initialized');
    }
    
    /**
     * Initialize interactions with website elements
     */
    initializeWebsiteInteractions() {
        // Define fully protected elements (no interaction, no hover effects)
        const fullyProtectedSelectors = [
            'header', 'footer', 
            '#game-container', '#game-container *',
            '#start-game', '#hero-start-game',
            '#inventory-panel', '#dialog-box',
            '#game-mode-indicator', '#keyboard-controls',
            '#keyboard-controls-panel',
            '.game-notification', '.game-tooltip',
            '.save-indicator', '#contact', '#contact *',
            'form', 'form *'
        ];
        
        // Define partially protected elements (allow hover, prevent breaking/dragging)
        const partiallyProtectedSelectors = [
            'nav', '.nav-links', '.nav-links *'
        ];
        
        // Add interactive class to ALL elements that can be affected by the game
        const interactiveSelectors = [
            'h1', 'h2', 'p', 'button', 'input', 'textarea',
            '.blog-post', 'img', 'div', 'section', 'article',
            'span', 'a', 'ul', 'ol', 'li', 'label'
        ];
        
        // First add protection classes to elements
        const fullyProtectedElements = document.querySelectorAll(fullyProtectedSelectors.join(','));
        fullyProtectedElements.forEach(element => {
            element.classList.add('ui-protected');
            console.log('Fully protected UI element:', element.tagName, element.id || '');
        });
        
        const partiallyProtectedElements = document.querySelectorAll(partiallyProtectedSelectors.join(','));
        partiallyProtectedElements.forEach(element => {
            element.classList.add('ui-partial-protected');
            console.log('Partially protected UI element:', element.tagName, element.id || '');
        });
        
        // Then get all potential interactive elements
        const websiteElements = document.querySelectorAll(interactiveSelectors.join(','));
        
        websiteElements.forEach(element => {
            // Skip elements that are part of the game
            if (element.closest('#game-container')) return;
            
            // Skip body and html elements
            if (element === document.body || element === document.documentElement) return;
            
            // Skip fully protected elements and their children
            if (element.classList.contains('ui-protected') || element.closest('.ui-protected')) {
                return;
            }
            
            // Add interactable class for styling and interaction
            element.classList.add('game-interactable', 'interactable');
            
            // Generate a unique ID if not present
            if (!element.id) {
                element.id = `interactable-${Math.random().toString(36).substr(2, 9)}`;
            }
            
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
            } else if (tagName === 'nav' || tagName === 'ul' || tagName === 'li' || tagName === 'a') {
                interactionType = 'navigation';
            }
            
            element.dataset.gameInteraction = interactionType;
            
            // Add health property for breakable elements (all elements are breakable)
            element.dataset.gameHealth = '3';
            element.dataset.gameMaxHealth = '3';
            
            // Add mousedown listener for dragging
            element.addEventListener('mousedown', this.handleElementMouseDown);
        });
    }
    
    /**
     * Restore the world state from localStorage
     */
    restoreWorldState() {
        // Handle broken elements
        this.worldState.brokenElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Skip protected elements
                if (element.classList.contains('ui-protected') || 
                    element.closest('.ui-protected') ||
                    element.classList.contains('ui-partial-protected') ||
                    element.closest('.ui-partial-protected')) {
                    return;
                }
                
                element.dataset.gameHealth = '0';
                element.classList.add('game-destroyed');
                
                // Apply broken state visuals
                if (element.tagName.toLowerCase() === 'p') {
                    element.textContent = '[redacted]';
                } else if (element.tagName.toLowerCase() === 'img') {
                    element.style.opacity = '0.2';
                    element.style.filter = 'grayscale(100%)';
                }
            }
        });
        
        // Handle moved elements
        Object.entries(this.worldState.movedElements).forEach(([id, position]) => {
            const element = document.getElementById(id);
            if (element) {
                // Skip protected elements
                if (element.classList.contains('ui-protected') || 
                    element.closest('.ui-protected') ||
                    element.classList.contains('ui-partial-protected') ||
                    element.closest('.ui-partial-protected')) {
                    return;
                }
                
                // Set element to absolute position if not already
                const computedStyle = window.getComputedStyle(element);
                if (computedStyle.position !== 'absolute') {
                    element.style.position = 'absolute';
                }
                
                // Apply saved position
                element.style.left = `${position.x}px`;
                element.style.top = `${position.y}px`;
            }
        });
    }
    
    /**
     * Load world state from localStorage
     */
    loadWorldState() {
        const savedState = localStorage.getItem('butteredUpsad_worldState');
        return savedState ? JSON.parse(savedState) : null;
    }
    
    /**
     * Save world state to localStorage
     */
    saveWorldState() {
        localStorage.setItem('butteredUpsad_worldState', JSON.stringify(this.worldState));
    }
    
    /**
     * Handle mousedown on DOM elements for dragging
     */
    handleElementMouseDown(event) {
        // Only process if game is running
        if (!this.gameEngine.isRunning) return;
        
        // Prevent default behavior to avoid text selection
        event.preventDefault();
        
        // Get the interactable element
        let target = event.target;
        
        // Find closest interactable parent
        while (target && !target.classList.contains('interactable')) {
            target = target.parentElement;
            
            // Stop if reached game container or document body
            if (!target || target === this.container || target === document.body) {
                return;
            }
        }
        
        // Don't allow dragging protected UI elements (both fully and partially protected)
        if (target.classList.contains('ui-protected') || 
            target.closest('.ui-protected') ||
            target.classList.contains('ui-partial-protected') ||
            target.closest('.ui-partial-protected')) {
            console.log('Prevented dragging of protected UI element');
            return;
        }
        
        // Start dragging the element
        this.draggingElement = target;
        
        // Calculate offsets from the mouse position to the element's top-left corner
        const rect = target.getBoundingClientRect();
        this.elementDragOffsetX = event.clientX - rect.left;
        this.elementDragOffsetY = event.clientY - rect.top;
        
        // Set position to absolute if not already
        const computedStyle = window.getComputedStyle(target);
        if (computedStyle.position !== 'absolute') {
            // Save the original position information for reference
            target.dataset.originalPosition = computedStyle.position;
            target.dataset.originalLeft = computedStyle.left;
            target.dataset.originalTop = computedStyle.top;
            
            // Convert to absolute positioning
            target.style.position = 'absolute';
            target.style.left = `${rect.left}px`;
            target.style.top = `${rect.top}px`;
            target.style.width = `${rect.width}px`;
            target.style.zIndex = '1000'; // Bring to front
        }
        
        // Add visual feedback
        target.classList.add('dragging');
        
        // Stop event propagation
        event.stopPropagation();
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
     * Handle mouse down for dragging game objects
     */
    handleMouseDown(event) {
        // Only process if game is running
        if (!this.gameEngine.isRunning) return;
        
        const x = event.clientX;
        const y = event.clientY;
        
        // Get objects at mouse position
        if (this.gameEngine.objectManager) {
            const objects = this.gameEngine.objectManager.getObjectsAt(x, y);
            
            // Find first interactive object
            const draggable = objects.find(obj => obj.interactive);
            
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
     * Handle mouse move for dragging both game objects and DOM elements
     */
    handleMouseMove(event) {
        // Handle game object dragging
        if (this.draggingObject) {
            const x = event.clientX;
            const y = event.clientY;
            
            // Calculate new position
            const newX = x - this.dragOffsetX;
            const newY = y - this.dragOffsetY;
            
            // Keep within bounds
            const boundedX = Math.max(0, Math.min(window.innerWidth - this.draggingObject.width, newX));
            const boundedY = Math.max(0, Math.min(window.innerHeight - this.draggingObject.height, newY));
            
            // Check for collisions with other objects
            const objectManager = this.gameEngine.objectManager;
            if (objectManager) {
                // Try to move the object with collision handling
                const moved = objectManager.tryMoveObject(this.draggingObject, boundedX, boundedY);
                
                if (moved) {
                    // Success - object moved, visual update is handled in the move method
                    console.log(`Object ${this.draggingObject.id} moved to (${boundedX}, ${boundedY})`);
                } else {
                    // Couldn't move due to collisions, check if we hit any movable objects
                    const collidingObjects = objectManager.objects.filter(obj => 
                        obj !== this.draggingObject && 
                        !obj.destroyed && 
                        obj.solid &&
                        this.checkCollision(boundedX, boundedY, this.draggingObject.width, 
                                           this.draggingObject.height, obj)
                    );
                    
                    // Try to push movable objects
                    collidingObjects.forEach(obj => {
                        if (obj.movable) {
                            // Calculate push direction
                            const pushDx = boundedX - this.draggingObject.x;
                            const pushDy = boundedY - this.draggingObject.y;
                            
                            // Try to push the object
                            obj.move(pushDx, pushDy, objectManager);
                        }
                    });
                }
            }
        }
        
        // Handle DOM element dragging
        if (this.draggingElement) {
            const x = event.clientX;
            const y = event.clientY;
            
            // Update element position
            const newLeft = x - this.elementDragOffsetX;
            const newTop = y - this.elementDragOffsetY;
            
            // Apply new position
            this.draggingElement.style.left = `${newLeft}px`;
            this.draggingElement.style.top = `${newTop}px`;
            
            // Save the new position in the world state
            this.worldState.movedElements[this.draggingElement.id] = { x: newLeft, y: newTop };
            this.saveWorldState();
        }
    }
    
    /**
     * Check collision between a point/rectangle and an object
     */
    checkCollision(x, y, width, height, obj) {
        return (
            x < obj.x + obj.width &&
            x + width > obj.x &&
            y < obj.y + obj.height &&
            y + height > obj.y
        );
    }
    
    /**
     * Handle mouse up to end dragging
     */
    handleMouseUp(event) {
        // Handle game object dragging end
        if (this.draggingObject) {
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
                    
                    // If the drop target is movable, try to push it
                    if (dropTarget.movable) {
                        // Try to push the object in the direction of the drag
                        const pushDx = x - this.dragOffsetX - this.draggingObject.x;
                        const pushDy = y - this.dragOffsetY - this.draggingObject.y;
                        
                        if (pushDx !== 0 || pushDy !== 0) {
                            // Normalize the push direction
                            const pushLength = Math.sqrt(pushDx * pushDx + pushDy * pushDy);
                            const normalizedDx = pushDx / pushLength * 10; // Push by 10 pixels
                            const normalizedDy = pushDy / pushLength * 10;
                            
                            // Try to push the object
                            const pushed = dropTarget.move(normalizedDx, normalizedDy, this.gameEngine.objectManager);
                            
                            if (pushed) {
                                console.log(`Pushed ${dropTarget.type} by (${normalizedDx}, ${normalizedDy})`);
                            }
                        }
                    }
                    
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
        
        // Handle DOM element dragging end
        if (this.draggingElement) {
            // Remove dragging visual feedback
            this.draggingElement.classList.remove('dragging');
            
            // Reset dragging state
            this.draggingElement = null;
            this.elementDragOffsetX = 0;
            this.elementDragOffsetY = 0;
        }
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
        while (target && !target.classList.contains('interactable')) {
            target = target.parentElement;
            
            // Stop if reached game container or document body
            if (!target || target === this.container || target === document.body) {
                return;
            }
        }
        
        // Don't interact with fully protected UI elements
        if (target && (target.classList.contains('ui-protected') || target.closest('.ui-protected'))) {
            console.log('Prevented interaction with fully protected UI element');
            return;
        }
        
        // Don't interact with partially protected UI elements
        if (target && (target.classList.contains('ui-partial-protected') || target.closest('.ui-partial-protected'))) {
            console.log('Prevented interaction with partially protected UI element');
            return;
        }
        
        // If found an interactable element
        if (target && target.classList.contains('interactable')) {
            console.log('Interacting with website element:', target);
            
            // Reduce health of the element when clicked (all elements are breakable)
            this.damageWebsiteElement(target);
            
            // Process based on interaction type
            const interactionType = target.dataset.gameInteraction || 'generic';
            
            switch (interactionType) {
                case 'header':
                    // Change text color randomly
                    target.style.color = this.getRandomColor();
                    break;
                    
                case 'navigation':
                    // Make nav elements wobble
                    target.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg)`;
                    break;
                    
                case 'control':
                    // Randomize position slightly
                    const offsetX = (Math.random() - 0.5) * 20;
                    const offsetY = (Math.random() - 0.5) * 20;
                    target.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
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
        
        // Don't damage protected UI elements (both fully and partially protected)
        if (element.classList.contains('ui-protected') || 
            element.closest('.ui-protected') ||
            element.classList.contains('ui-partial-protected') ||
            element.closest('.ui-partial-protected')) {
            console.log('Prevented damaging protected UI element');
            return;
        }
        
        // Reduce health
        let health = parseInt(element.dataset.gameHealth);
        health = Math.max(0, health - 1);
        element.dataset.gameHealth = health.toString();
        
        // Visual effects based on health
        element.classList.remove('game-damaged-1', 'game-damaged-2', 'game-destroyed');
        
        if (health === 0) {
            // Element "destroyed"
            element.classList.add('game-destroyed');
            
            // Add to broken elements list for persistence
            if (element.id && !this.worldState.brokenElements.includes(element.id)) {
                this.worldState.brokenElements.push(element.id);
                this.saveWorldState();
            }
            
            // Special effects based on element type
            if (element.tagName.toLowerCase() === 'p') {
                element.textContent = '[redacted]';
            } else if (element.tagName.toLowerCase() === 'img') {
                element.style.opacity = '0.2';
                element.style.filter = 'grayscale(100%)';
            } else if (element.tagName.toLowerCase() === 'button') {
                element.disabled = true;
                element.style.opacity = '0.5';
            } else if (element.tagName.toLowerCase() === 'a') {
                element.style.textDecoration = 'line-through';
                element.href = '#broken-link';
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
                
            case 'collectible_movable-block':
                // Collectible pushes movable block
                sourceObj.destroy();
                
                // Push the block slightly in a random direction
                const pushX = (Math.random() - 0.5) * 40;
                const pushY = (Math.random() - 0.5) * 40;
                targetObj.move(pushX, pushY, this.gameEngine.objectManager);
                break;
                
            default:
                // If the target is movable, try to push it
                if (targetObj.movable) {
                    // Push the target away from the source
                    const dx = targetObj.x - sourceObj.x;
                    const dy = targetObj.y - sourceObj.y;
                    
                    // Normalize and scale
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                    const pushX = (dx / distance) * 30;
                    const pushY = (dy / distance) * 30;
                    
                    targetObj.move(pushX, pushY, this.gameEngine.objectManager);
                } else {
                    // Generic interaction - source takes damage
                    sourceObj.takeDamage(1);
                }
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
        
        // Clean up element mousedown listeners
        const interactables = document.querySelectorAll('.interactable');
        interactables.forEach(element => {
            element.removeEventListener('mousedown', this.handleElementMouseDown);
        });
    }
}
