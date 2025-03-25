/**
 * Inventory Manager
 * Handles player inventory and item interactions.
 */

class InventoryManager {
    constructor() {
        this.items = [];
        this.maxItems = 12; // Maximum number of items in inventory (but no actual limit imposed)
        this.inventoryPanel = document.getElementById('inventory-panel');
        this.inventoryItems = document.getElementById('inventory-items');
        
        // Bind methods
        this.handleCollectItem = this.handleCollectItem.bind(this);
        this.handleItemUse = this.handleItemUse.bind(this);
        this.toggleInventoryPanel = this.toggleInventoryPanel.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        
        // Set up event listeners
        document.addEventListener('collect-item', (event) => {
            if (event.detail) {
                this.handleCollectItem(event.detail);
            }
        });
        
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize inventory
     */
    initialize() {
        console.log('Initializing inventory manager');
        
        // Update the inventory panel appearance
        if (this.inventoryPanel) {
            // Position the panel on the left side of the screen
            this.inventoryPanel.style.left = '0';
            this.inventoryPanel.style.right = 'auto';
            this.inventoryPanel.style.transform = 'translateX(-100%)';
            this.inventoryPanel.style.transition = 'transform 0.3s ease-out';
            
            // Add a label to indicate the Tab key toggle
            const tabHint = document.createElement('div');
            tabHint.className = 'tab-hint';
            tabHint.textContent = 'Press Tab to toggle';
            this.inventoryPanel.appendChild(tabHint);
        }
        
        // Set up drop zone for the entire game container
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.addEventListener('dragover', (e) => {
                e.preventDefault(); // Allow drop
            });
            
            gameContainer.addEventListener('drop', this.handleDrop);
        }
    }
    
    /**
     * Handle Tab key to toggle inventory
     */
    handleKeyPress(event) {
        // Toggle inventory with Tab key
        if (event.key === 'Tab') {
            event.preventDefault(); // Prevent default Tab behavior
            this.toggleInventoryPanel();
        }
    }
    
    /**
     * Toggle inventory panel visibility
     */
    toggleInventoryPanel() {
        if (!this.inventoryPanel) return;
        
        // Toggle the transform to slide in/out
        if (this.inventoryPanel.style.transform === 'translateX(0px)') {
            this.inventoryPanel.style.transform = 'translateX(-100%)';
        } else {
            this.inventoryPanel.style.transform = 'translateX(0)';
        }
    }
    
    /**
     * Show inventory panel
     */
    showInventoryPanel() {
        if (!this.inventoryPanel) return;
        
        this.inventoryPanel.style.transform = 'translateX(0)';
    }
    
    /**
     * Hide inventory panel
     */
    hideInventoryPanel() {
        if (!this.inventoryPanel) return;
        
        this.inventoryPanel.style.transform = 'translateX(-100%)';
    }
    
    /**
     * Add item to inventory
     */
    addItem(item) {
        // Add item to inventory (no limit imposed)
        this.items.push(item);
        
        // Update UI
        this.refreshInventoryUI();
        
        // Track stat for item collected
        this.incrementStat('itemsCollected');
        
        console.log(`Added ${item.type} to inventory`);
        return true;
    }
    
    /**
     * Increment a player stat
     */
    incrementStat(statName, amount = 1) {
        if (!gameEngine || !gameEngine.playerStats) return;
        
        if (gameEngine.playerStats[statName] !== undefined) {
            gameEngine.playerStats[statName] += amount;
            console.log(`${statName}: ${gameEngine.playerStats[statName]}`);
        } else {
            gameEngine.playerStats[statName] = amount;
            console.log(`${statName}: ${amount}`);
        }
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
                    this.incrementStat('coinsUsed');
                    break;
                    
                case 'key':
                    // Keys can be used to unlock things
                    this.incrementStat('keysUsed');
                    consumed = true;
                    break;
                    
                case 'special':
                    // Special items have powerful effects
                    // Trigger a special website effect
                    document.body.classList.add('special-effect');
                    setTimeout(() => {
                        document.body.classList.remove('special-effect');
                    }, 2000);
                    this.incrementStat('specialItemsUsed');
                    consumed = true;
                    break;
                    
                default:
                    // By default, items are consumed when used
                    this.incrementStat('itemsUsed');
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
     * Handle drag start for inventory items
     */
    handleDragStart(event) {
        const itemElement = event.currentTarget;
        const index = parseInt(itemElement.dataset.index, 10);
        
        if (!isNaN(index)) {
            // Store the item index in the drag data
            event.dataTransfer.setData('application/json', JSON.stringify({
                type: 'inventory-item',
                index: index,
                itemType: this.items[index].type,
                itemValue: this.items[index].value
            }));
            
            // Add dragging class for visual feedback
            itemElement.classList.add('dragging');
            
            // Set the drag image
            const dragImage = itemElement.cloneNode(true);
            dragImage.style.width = '40px';
            dragImage.style.height = '40px';
            document.body.appendChild(dragImage);
            event.dataTransfer.setDragImage(dragImage, 20, 20);
            
            // Remove the clone after drag starts
            setTimeout(() => {
                if (dragImage.parentNode) {
                    dragImage.parentNode.removeChild(dragImage);
                }
            }, 0);
        }
    }
    
    /**
     * Handle drag end for inventory items
     */
    handleDragEnd(event) {
        event.currentTarget.classList.remove('dragging');
    }
    
    /**
     * Handle drop of inventory items into the world
     */
    handleDrop(event) {
        event.preventDefault();
        
        // Get the drop data
        const jsonData = event.dataTransfer.getData('application/json');
        if (!jsonData) return;
        
        try {
            const data = JSON.parse(jsonData);
            
            if (data.type === 'inventory-item') {
                // Remove the item from inventory
                const item = this.removeItem(data.index);
                
                if (item) {
                    // Create the item in the world at the drop position
                    if (gameEngine && gameEngine.objectManager) {
                        const x = event.clientX;
                        const y = event.clientY;
                        
                        // Create appropriate object based on item type
                        let newObject;
                        
                        switch (item.type) {
                            case 'coin':
                                newObject = new CollectibleObject(x, y, 'coin');
                                newObject.value = item.value;
                                break;
                                
                            case 'key':
                                newObject = new CollectibleObject(x, y, 'key');
                                break;
                                
                            case 'special':
                                newObject = new CollectibleObject(x, y, 'special');
                                newObject.value = item.value;
                                break;
                                
                            default:
                                newObject = new CollectibleObject(x, y, item.type);
                                break;
                        }
                        
                        // Add the object to the world
                        gameEngine.objectManager.addObject(newObject);
                        
                        // Track stat for items dropped in world
                        this.incrementStat('itemsDropped');
                        
                        console.log(`Dropped ${item.type} into the world at (${x}, ${y})`);
                    }
                }
            }
        } catch (e) {
            console.error('Error processing dropped item:', e);
        }
    }.bind(this)
    
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
            
            // Add click handler for using items
            itemElement.addEventListener('click', this.handleItemUse.bind(this));
            
            // Add drag functionality
            itemElement.draggable = true;
            itemElement.addEventListener('dragstart', this.handleDragStart);
            itemElement.addEventListener('dragend', this.handleDragEnd);
            
            // Add to inventory UI
            this.inventoryItems.appendChild(itemElement);
        });
        
        // Add empty slots for visual reference (but not enforcing a limit)
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
