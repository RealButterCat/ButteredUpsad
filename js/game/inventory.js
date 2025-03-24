/**
 * Inventory Manager
 * Handles player inventory and item interactions.
 */

class InventoryManager {
    constructor() {
        this.items = [];
        this.maxItems = 12; // Maximum number of items in inventory
        this.inventoryPanel = document.getElementById('inventory-panel');
        this.inventoryItems = document.getElementById('inventory-items');
        
        // Bind methods
        this.handleCollectItem = this.handleCollectItem.bind(this);
        this.handleItemUse = this.handleItemUse.bind(this);
        this.toggleInventoryPanel = this.toggleInventoryPanel.bind(this);
        
        // Set up event listeners
        document.addEventListener('collect-item', (event) => {
            if (event.detail) {
                this.handleCollectItem(event.detail);
            }
        });
        
        // Toggle inventory panel on hover near right edge
        document.addEventListener('mousemove', (event) => {
            const edgeThreshold = 50;
            
            if (this.inventoryPanel && event.clientX > window.innerWidth - edgeThreshold) {
                this.showInventoryPanel();
            } else if (this.inventoryPanel && 
                     this.inventoryPanel.classList.contains('visible') && 
                     event.clientX < window.innerWidth - 250) {
                this.hideInventoryPanel();
            }
        });
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize inventory
     */
    initialize() {
        console.log('Initializing inventory manager');
        
        if (this.inventoryPanel) {
            // Create inventory panel toggle button
            const toggleButton = document.createElement('button');
            toggleButton.id = 'inventory-toggle';
            toggleButton.textContent = 'I';
            toggleButton.className = 'inventory-toggle';
            toggleButton.addEventListener('click', this.toggleInventoryPanel);
            
            document.body.appendChild(toggleButton);
        }
    }
    
    /**
     * Toggle inventory panel visibility
     */
    toggleInventoryPanel() {
        if (!this.inventoryPanel) return;
        
        this.inventoryPanel.classList.toggle('hidden');
        this.inventoryPanel.classList.toggle('visible');
    }
    
    /**
     * Show inventory panel
     */
    showInventoryPanel() {
        if (!this.inventoryPanel) return;
        
        this.inventoryPanel.classList.remove('hidden');
        this.inventoryPanel.classList.add('visible');
    }
    
    /**
     * Hide inventory panel
     */
    hideInventoryPanel() {
        if (!this.inventoryPanel) return;
        
        this.inventoryPanel.classList.remove('visible');
        this.inventoryPanel.classList.add('hidden');
    }
    
    /**
     * Add item to inventory
     */
    addItem(item) {
        // Check if inventory is full
        if (this.items.length >= this.maxItems) {
            console.log('Inventory is full!');
            return false;
        }
        
        // Add item to inventory
        this.items.push(item);
        
        // Update UI
        this.refreshInventoryUI();
        
        console.log(`Added ${item.type} to inventory`);
        return true;
    }
    
    /**
     * Remove item from inventory
     */
    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            const item = this.items[index];
            this.items.splice(index, 1);
            
            // Update UI
            this.refreshInventoryUI();
            
            console.log(`Removed ${item.type} from inventory`);
            return item;
        }
        
        return null;
    }
    
    /**
     * Use item from inventory
     */
    useItem(index) {
        if (index >= 0 && index < this.items.length) {
            const item = this.items[index];
            
            console.log(`Using ${item.type} from inventory`);
            
            // Process item effects based on type
            let consumed = false;
            
            switch (item.type) {
                case 'coin':
                    // Coins just add to score, not consumed
                    break;
                    
                case 'key':
                    // Keys can be used to unlock things
                    // For now, just consume the item
                    consumed = true;
                    break;
                    
                case 'special':
                    // Special items have powerful effects
                    // Trigger a special website effect
                    document.body.classList.add('special-effect');
                    setTimeout(() => {
                        document.body.classList.remove('special-effect');
                    }, 2000);
                    consumed = true;
                    break;
                    
                default:
                    // By default, items are consumed when used
                    consumed = true;
            }
            
            // Remove item if consumed
            if (consumed) {
                this.removeItem(index);
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle collecting an item
     */
    handleCollectItem(itemData) {
        if (!itemData) return;
        
        // Create item from data
        const item = {
            id: Math.random().toString(36).substr(2, 9),
            type: itemData.type || 'generic',
            value: itemData.value || 1
        };
        
        // Add to inventory
        const added = this.addItem(item);
        
        // Show feedback if added
        if (added) {
            // Create floating text effect at collection position
            const gameContainer = document.getElementById('game-container');
            
            if (gameContainer) {
                const floatingText = document.createElement('div');
                floatingText.className = 'floating-text';
                floatingText.textContent = `+1 ${item.type}`;
                floatingText.style.left = `${event.clientX}px`;
                floatingText.style.top = `${event.clientY}px`;
                
                gameContainer.appendChild(floatingText);
                
                // Animate and remove
                setTimeout(() => {
                    floatingText.style.opacity = '0';
                    floatingText.style.transform = 'translateY(-50px)';
                    
                    setTimeout(() => {
                        if (floatingText.parentNode) {
                            floatingText.parentNode.removeChild(floatingText);
                        }
                    }, 500);
                }, 10);
            }
        }
    }
    
    /**
     * Handle item use from inventory UI
     */
    handleItemUse(event) {
        const itemElement = event.currentTarget;
        const index = parseInt(itemElement.dataset.index, 10);
        
        if (!isNaN(index)) {
            this.useItem(index);
        }
    }
    
    /**
     * Refresh inventory UI
     */
    refreshInventoryUI() {
        if (!this.inventoryItems) return;
        
        // Clear inventory UI
        this.inventoryItems.innerHTML = '';
        
        // Add items to UI
        this.items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = `inventory-item ${item.type}`;
            itemElement.dataset.index = index;
            
            // Set content based on item type
            switch (item.type) {
                case 'coin':
                    itemElement.innerHTML = `<span class="coin-icon">●</span>`;
                    break;
                    
                case 'key':
                    itemElement.innerHTML = `<span class="key-icon">⚿</span>`;
                    break;
                    
                case 'special':
                    itemElement.innerHTML = `<span class="special-icon">★</span>`;
                    break;
                    
                default:
                    itemElement.innerHTML = `<span class="item-icon">▪</span>`;
            }
            
            // Show value if greater than 1
            if (item.value > 1) {
                const valueElement = document.createElement('span');
                valueElement.className = 'item-value';
                valueElement.textContent = item.value;
                itemElement.appendChild(valueElement);
            }
            
            // Add click handler
            itemElement.addEventListener('click', this.handleItemUse);
            
            // Add drag functionality
            itemElement.draggable = true;
            itemElement.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('text/plain', index);
                itemElement.classList.add('dragging');
            });
            
            itemElement.addEventListener('dragend', () => {
                itemElement.classList.remove('dragging');
            });
            
            // Add to inventory UI
            this.inventoryItems.appendChild(itemElement);
        });
        
        // Add empty slots to fill up to max
        for (let i = this.items.length; i < this.maxItems; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'inventory-item empty';
            this.inventoryItems.appendChild(emptySlot);
        }
    }
    
    /**
     * Get item count by type
     */
    getItemCount(type) {
        return this.items.filter(item => item.type === type).length;
    }
    
    /**
     * Get total value of items by type
     */
    getItemValue(type) {
        return this.items
            .filter(item => item.type === type)
            .reduce((total, item) => total + (item.value || 1), 0);
    }
    
    /**
     * Check if player has a specific item type
     */
    hasItemType(type, minCount = 1) {
        return this.getItemCount(type) >= minCount;
    }
    
    /**
     * Serialize inventory for saving
     */
    serialize() {
        return {
            items: this.items
        };
    }
    
    /**
     * Deserialize inventory from saved data
     */
    deserialize(data) {
        if (data && data.items) {
            this.items = data.items;
            this.refreshInventoryUI();
        }
    }
}
