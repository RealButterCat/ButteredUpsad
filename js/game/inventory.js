/**
 * Inventory Manager
 * Handles player inventory and item interactions.
 */

class InventoryManager {
    constructor() {
        this.items = [];
        this.maxItems = 12; // Maximum number of items in inventory
        this.inventoryPanel = document.getElementById('inventory-panel');
        this.inventoryToggle = document.getElementById('inventory-toggle');
        this.inventoryItems = document.getElementById('inventory-items');
        this.isPanelVisible = false;
        this.isDragging = false;
        this.draggedItem = null;
        
        // Bind methods
        this.handleCollectItem = this.handleCollectItem.bind(this);
        this.handleItemUse = this.handleItemUse.bind(this);
        this.toggleInventoryPanel = this.toggleInventoryPanel.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        
        // Set up event listeners
        document.addEventListener('collect-item', (event) => {
            if (event.detail) {
                this.handleCollectItem(event.detail);
            }
        });
        
        // Add event listeners for drag/drop
        document.addEventListener('dragover', this.handleDragOver);
        document.addEventListener('drop', this.handleDrop);
        
        // Initialize inventory
        this.initialize();
    }
    
    /**
     * Initialize inventory
     */
    initialize() {
        console.log('Initializing inventory manager');
        
        // Set up inventory toggle button
        if (this.inventoryToggle) {
            this.inventoryToggle.addEventListener('click', this.toggleInventoryPanel);
            this.updateInventoryCounter();
        }
        
        // Create testing items
        this.addStartingItems();
    }
    
    /**
     * Add some items for testing
     */
    addStartingItems() {
        // Add a couple coins to start with
        this.addItem({
            id: 'coin-1',
            type: 'coin',
            value: 1,
            name: 'Gold Coin',
            description: 'A shiny gold coin. Collect these for points!'
        });
        
        this.addItem({
            id: 'key-1',
            type: 'key',
            value: 1,
            name: 'Brass Key',
            description: 'A small brass key. It might open something nearby.'
        });
    }
    
    /**
     * Toggle inventory panel visibility
     */
    toggleInventoryPanel() {
        if (!this.inventoryPanel) return;
        
        this.isPanelVisible = !this.isPanelVisible;
        
        if (this.isPanelVisible) {
            this.showInventoryPanel();
        } else {
            this.hideInventoryPanel();
        }
    }
    
    /**
     * Show inventory panel
     */
    showInventoryPanel() {
        if (!this.inventoryPanel) return;
        
        this.inventoryPanel.classList.remove('hidden');
        this.inventoryPanel.classList.add('visible');
        this.isPanelVisible = true;
        
        // Refresh inventory display
        this.refreshInventoryUI();
    }
    
    /**
     * Hide inventory panel
     */
    hideInventoryPanel() {
        if (!this.inventoryPanel) return;
        
        this.inventoryPanel.classList.remove('visible');
        this.inventoryPanel.classList.add('hidden');
        this.isPanelVisible = false;
    }
    
    /**
     * Add item to inventory
     */
    addItem(item) {
        // Check if inventory is full
        if (this.items.length >= this.maxItems) {
            if (gameEngine && gameEngine.uiManager) {
                gameEngine.uiManager.showNotification('Inventory is full!', 'warning');
            }
            console.log('Inventory is full!');
            return false;
        }
        
        // Ensure the item has an ID if not provided
        if (!item.id) {
            item.id = `item-${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Add default properties if not specified
        if (!item.name) {
            item.name = this.capitalizeFirstLetter(item.type);
        }
        
        if (!item.description) {
            item.description = `A ${item.type}.`;
        }
        
        if (item.value === undefined) {
            item.value = 1;
        }
        
        // Add item to inventory
        this.items.push(item);
        
        // Update UI
        this.refreshInventoryUI();
        this.updateInventoryCounter();
        
        // Show notification
        if (gameEngine && gameEngine.uiManager) {
            gameEngine.uiManager.showNotification(`Added ${item.name} to inventory`, 'success');
        }
        
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
            this.updateInventoryCounter();
            
            // Show notification
            if (gameEngine && gameEngine.uiManager) {
                gameEngine.uiManager.showNotification(`Removed ${item.name} from inventory`, 'info');
            }
            
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
                    // Coins increase score
                    if (gameEngine && gameEngine.player) {
                        gameEngine.player.gainExperience(item.value * 5);
                    }
                    consumed = true;
                    break;
                    
                case 'key':
                    // Keys can be used to unlock things if near a locked object
                    if (gameEngine && gameEngine.objectManager) {
                        const lockedObjects = gameEngine.objectManager.getObjectsOfType('locked');
                        let unlocked = false;
                        
                        for (const lockObj of lockedObjects) {
                            // Check if player is near this locked object
                            if (gameEngine.player && this.isPlayerNearObject(lockObj)) {
                                // Unlock the object
                                lockObj.unlock();
                                unlocked = true;
                                
                                // Show notification
                                if (gameEngine.uiManager) {
                                    gameEngine.uiManager.showNotification(`Unlocked ${lockObj.name || 'object'}!`, 'success');
                                }
                                break;
                            }
                        }
                        
                        if (!unlocked) {
                            // No nearby locked objects
                            if (gameEngine.uiManager) {
                                gameEngine.uiManager.showNotification('Nothing nearby to unlock', 'info');
                            }
                            return false; // Don't consume the key
                        }
                    }
                    consumed = true;
                    break;
                    
                case 'potion':
                    // Potions heal the player
                    if (gameEngine && gameEngine.player) {
                        gameEngine.player.heal(item.value * 10);
                    }
                    consumed = true;
                    break;
                    
                case 'special':
                    // Special items have powerful effects
                    // Trigger a special website effect
                    document.body.classList.add('special-effect');
                    setTimeout(() => {
                        document.body.classList.remove('special-effect');
                    }, 2000);
                    
                    // Also give XP
                    if (gameEngine && gameEngine.player) {
                        gameEngine.player.gainExperience(item.value * 20);
                    }
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
     * Check if player is near an object
     */
    isPlayerNearObject(obj) {
        if (!gameEngine || !gameEngine.player) return false;
        
        const player = gameEngine.player;
        const interactionDistance = 100; // pixels
        
        // Calculate distance between centers
        const dx = (player.x + player.width/2) - (obj.x + obj.width/2);
        const dy = (player.y + player.height/2) - (obj.y + obj.height/2);
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        return distance <= interactionDistance;
    }
    
    /**
     * Handle collecting an item
     */
    handleCollectItem(itemData) {
        if (!itemData) return;
        
        // Create item from data
        const item = {
            id: itemData.id || `item-${Math.random().toString(36).substr(2, 9)}`,
            type: itemData.type || 'generic',
            value: itemData.value || 1,
            name: itemData.name || this.capitalizeFirstLetter(itemData.type || 'Item'),
            description: itemData.description || 'A collectible item.'
        };
        
        // Add to inventory
        const added = this.addItem(item);
        
        // Show feedback if added
        if (added) {
            // Create floating text effect at collection position
            if (gameEngine && gameEngine.uiManager) {
                gameEngine.uiManager.showFloatingText(
                    `+ ${item.name}`, 
                    itemData.x || 0, 
                    itemData.y || 0, 
                    '#f1c40f'
                );
            }
            
            // Update quests if this item type is needed for any active quests
            if (gameEngine && gameEngine.questManager) {
                gameEngine.questManager.updateItemCollectionQuests(item.type, 1);
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
     * Handle start of item dragging
     */
    handleDragStart(event) {
        const itemElement = event.currentTarget;
        const index = parseInt(itemElement.dataset.index, 10);
        
        if (isNaN(index)) return;
        
        this.isDragging = true;
        this.draggedItem = {
            index: index,
            item: this.items[index]
        };
        
        itemElement.classList.add('dragging');
        
        // Set dragged item data
        event.dataTransfer.setData('text/plain', JSON.stringify({
            type: 'inventory-item',
            index: index,
            itemType: this.items[index].type
        }));
        
        // Set drag image (optional)
        const dragImage = itemElement.cloneNode(true);
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 20, 20);
        
        // Clean up the temporary element after a delay
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }
    
    /**
     * Handle end of item dragging
     */
    handleDragEnd(event) {
        const itemElements = document.querySelectorAll('.inventory-item');
        itemElements.forEach(el => el.classList.remove('dragging'));
        
        this.isDragging = false;
        this.draggedItem = null;
    }
    
    /**
     * Handle drag over event (to allow dropping)
     */
    handleDragOver(event) {
        // Prevent default to allow drop
        event.preventDefault();
    }
    
    /**
     * Handle drop event
     */
    handleDrop(event) {
        event.preventDefault();
        
        if (!this.isDragging || !this.draggedItem) return;
        
        // Get drop target
        const dropTarget = event.target;
        
        // Check if dropped on a game object
        if (dropTarget.classList.contains('game-object') || 
            dropTarget.closest('.game-object')) {
            
            const gameObj = dropTarget.classList.contains('game-object') ? 
                dropTarget : dropTarget.closest('.game-object');
            
            // Get object ID
            const objId = gameObj.dataset.id;
            
            if (objId && gameEngine && gameEngine.objectManager) {
                const targetObj = gameEngine.objectManager.getObjectById(objId);
                
                if (targetObj) {
                    console.log(`Dropped ${this.draggedItem.item.type} on ${targetObj.type}`);
                    
                    // Handle the interaction based on item and target types
                    this.handleItemObjectInteraction(this.draggedItem.index, targetObj);
                }
            }
        }
        
        // End dragging
        this.handleDragEnd(event);
    }
    
    /**
     * Handle interaction between dragged item and game object
     */
    handleItemObjectInteraction(itemIndex, targetObj) {
        if (itemIndex < 0 || itemIndex >= this.items.length) return;
        
        const item = this.items[itemIndex];
        
        // Different interactions based on item and target types
        switch (item.type) {
            case 'key':
                if (targetObj.type === 'locked') {
                    // Unlock the object
                    targetObj.unlock();
                    
                    // Remove the key
                    this.removeItem(itemIndex);
                    
                    // Show success notification
                    if (gameEngine && gameEngine.uiManager) {
                        gameEngine.uiManager.showNotification(`Unlocked ${targetObj.name || 'object'}!`, 'success');
                    }
                } else {
                    // Key doesn't work on this object
                    if (gameEngine && gameEngine.uiManager) {
                        gameEngine.uiManager.showNotification(`Can't use key on this object`, 'info');
                    }
                }
                break;
                
            case 'coin':
                if (targetObj.type === 'npc') {
                    // Give coin to NPC
                    targetObj.receiveCoin(item.value);
                    
                    // Remove coin from inventory
                    this.removeItem(itemIndex);
                    
                    // Trigger dialog
                    if (gameEngine && gameEngine.dialogManager) {
                        const customDialog = {
                            text: `Thanks for the ${item.value} coin${item.value > 1 ? 's' : ''}!`,
                            options: [
                                { text: "You're welcome!", responseIndex: -1 }
                            ]
                        };
                        
                        gameEngine.dialogManager.showCustomDialog(targetObj, customDialog);
                    }
                } else {
                    // Can't use coin on this object
                    if (gameEngine && gameEngine.uiManager) {
                        gameEngine.uiManager.showNotification(`Can't use coin on this object`, 'info');
                    }
                }
                break;
                
            default:
                // Default behavior - just use the item
                this.useItem(itemIndex);
        }
    }
    
    /**
     * Update inventory counter on the toggle button
     */
    updateInventoryCounter() {
        if (!this.inventoryToggle) return;
        
        // Set the counter
        this.inventoryToggle.setAttribute('data-count', this.items.length.toString());
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
            itemElement.title = `${item.name}: ${item.description}`;
            
            // Make draggable
            itemElement.draggable = true;
            itemElement.addEventListener('dragstart', this.handleDragStart);
            itemElement.addEventListener('dragend', this.handleDragEnd);
            
            // Set content based on item type
            let iconContent = '▪';
            
            switch (item.type) {
                case 'coin':
                    iconContent = '●';
                    break;
                    
                case 'key':
                    iconContent = '⚿';
                    break;
                    
                case 'potion':
                    iconContent = '⚗';
                    break;
                    
                case 'special':
                    iconContent = '★';
                    break;
            }
            
            itemElement.innerHTML = `<span class="item-icon">${iconContent}</span>`;
            
            // Show value if greater than 1
            if (item.value > 1) {
                const valueElement = document.createElement('span');
                valueElement.className = 'item-value';
                valueElement.textContent = item.value;
                itemElement.appendChild(valueElement);
            }
            
            // Add click handler for using item
            itemElement.addEventListener('click', this.handleItemUse);
            
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
     * Helper to capitalize the first letter of a string
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
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
            this.updateInventoryCounter();
        }
    }
}
