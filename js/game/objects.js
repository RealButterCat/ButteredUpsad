// Partial update to the GameObjectManager class in objects.js
// This adds speech bubble functionality for NPCs

/**
 * Create DOM element for an object
 */
createDOMElement(object) {
    // Skip if already has element or container not found
    if (object.element || !this.container) return;
    
    // Create element
    const element = document.createElement('div');
    element.className = `game-object ${object.type}`;
    element.dataset.id = object.id;
    
    // Set position and size
    element.style.left = `${object.x}px`;
    element.style.top = `${object.y}px`;
    element.style.width = `${object.width}px`;
    element.style.height = `${object.height}px`;
    
    // Add class for interactive objects
    if (object.interactive) {
        element.classList.add('interactable');
    }
    
    // Add class for solid objects
    if (object.solid) {
        element.classList.add('solid');
    }
    
    // Add class for movable objects
    if (object.movable) {
        element.classList.add('movable');
    }
    
    // Add class for ghost objects
    if (object.ghost) {
        element.classList.add('ghost');
    }
    
    // Set initial damage visual if needed
    if (object.health < object.maxHealth) {
        const healthPercentage = object.health / object.maxHealth;
        
        if (healthPercentage <= 0.33) {
            element.classList.add('damaged-2');
        } else if (healthPercentage <= 0.66) {
            element.classList.add('damaged-1');
        }
    }
    
    // Add click handler
    element.addEventListener('click', (event) => {
        object.onClick(event);
    });
    
    // Store reference to element
    object.element = element;
    
    // Add to container
    this.container.appendChild(element);
    
    // Create speech bubble for NPCs
    if (object.type === 'npc' && typeof object.createSpeechBubble === 'function') {
        object.createSpeechBubble();
    }
}