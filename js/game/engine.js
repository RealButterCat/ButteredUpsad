/**
 * Game Engine
 * Handles core game functionality, rendering, and loop.
 */

class GameEngine {
    constructor() {
        // Game state
        this.isRunning = false;
        this.lastTimestamp = 0;
        this.gameContainer = document.getElementById('game-container');
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game systems
        this.player = null;
        this.world = null;
        this.objectManager = null;
        this.interactionManager = null;
        this.inventoryManager = null;
        this.dialogManager = null;
        this.questManager = null;
        this.reactivityManager = null;
        this.uiManager = null;
        
        // Auto-save timer
        this.autoSaveInterval = null;
        this.autoSaveDelay = 60000; // Save every minute
        
        // Initialize game container
        this.initializeCanvas();
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.autoSave = this.autoSave.bind(this);
        
        // Event listeners
        window.addEventListener('resize', this.handleResize);
    }
    
    /**
     * Start the game
     */
    start() {
        if (this.isRunning) return;
        
        console.log('Starting game engine...');
        
        // Set up game systems
        this.player = new Player(
            window.innerWidth / 2, 
            window.innerHeight / 2
        );
        
        this.world = new World();
        this.objectManager = new GameObjectManager();
        this.interactionManager = new InteractionManager(this);
        this.inventoryManager = new InventoryManager();
        this.dialogManager = new DialogManager();
        this.questManager = new QuestManager(this);
        
        // Initialize UI manager first so it can show loading feedback
        this.uiManager = new UIManager(this);
        
        // Create world reactivity system (must be after other systems are initialized)
        this.reactivityManager = new WorldReactivity(this);
        
        // Load saved game state if exists
        this.loadGameState();
        
        // Show game container with subtle transition
        this.gameContainer.classList.remove('hidden');
        setTimeout(() => {
            this.gameContainer.classList.add('active');
        }, 50);
        
        // Start game loop
        this.isRunning = true;
        requestAnimationFrame(this.gameLoop);
        
        // Initialize interactions
        this.interactionManager.initialize();
        
        // Start auto-save
        this.startAutoSave();
        
        // Transition UI to game mode
        if (this.uiManager) {
            this.uiManager.transitionToGameMode();
        }
        
        console.log('Game engine started!');
    }
    
    /**
     * Stop the game
     */
    stop() {
        if (!this.isRunning) return;
        
        console.log('Stopping game engine...');
        
        // Save current game state
        this.saveGameState();
        
        // Stop auto-save
        this.stopAutoSave();
        
        // Transition UI back to normal mode
        if (this.uiManager) {
            this.uiManager.transitionToNormalMode();
        }
        
        // Hide game container with subtle transition
        this.gameContainer.classList.remove('active');
        setTimeout(() => {
            this.gameContainer.classList.add('hidden');
        }, 300);
        
        // Stop game loop
        this.isRunning = false;
        
        // Clean up
        if (this.interactionManager) {
            this.interactionManager.cleanup();
        }
        
        if (this.uiManager) {
            this.uiManager.cleanup();
        }
        
        console.log('Game engine stopped!');
    }
    
    /**
     * Game loop
     */
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        // Clear canvas
        this.clearCanvas();
        
        // Update game state
        this.update(deltaTime / 1000); // Convert to seconds
        
        // Render game objects
        this.render();
        
        // Schedule next frame
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Update game state
     */
    update(deltaTime) {
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update world objects
        if (this.objectManager) {
            this.objectManager.update(deltaTime);
        }
    }
    
    /**
     * Render game objects
     */
    render() {
        // Render world
        if (this.world) {
            this.world.render(this.ctx);
        }
        
        // Render game objects
        if (this.objectManager) {
            this.objectManager.render(this.ctx);
        }
        
        // Render player
        if (this.player) {
            this.player.render(this.ctx);
        }
    }
    
    /**
     * Initialize canvas
     */
    initializeCanvas() {
        this.handleResize();
    }
    
    /**
     * Clear canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    /**
     * Start auto-save timer
     */
    startAutoSave() {
        this.autoSaveInterval = setInterval(this.autoSave, this.autoSaveDelay);
    }
    
    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    /**
     * Auto-save game state
     */
    autoSave() {
        if (!this.isRunning) return;
        
        this.saveGameState(true);
    }
    
    /**
     * Save game state to localStorage
     */
    saveGameState(isAutoSave = false) {
        const gameState = {
            player: this.player ? this.player.serialize() : null,
            world: this.world ? this.world.serialize() : null,
            objects: this.objectManager ? this.objectManager.serialize() : null,
            inventory: this.inventoryManager ? this.inventoryManager.serialize() : null,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('butteredUpsad_gameState', JSON.stringify(gameState));
        
        if (!isAutoSave) {
            console.log('Game state saved!');
        }
        
        // Also save reactivity state if available
        if (this.reactivityManager) {
            this.reactivityManager.saveState();
        }
        
        // Show save indicator if UI manager exists and not an auto-save
        if (this.uiManager && !isAutoSave) {
            this.uiManager.showNotification('Game progress saved', 'success', 2000);
        } else if (this.uiManager && isAutoSave) {
            // Show subtle auto-save indicator
            const saveIndicator = document.createElement('div');
            saveIndicator.className = 'save-indicator saving';
            saveIndicator.textContent = 'Auto-saving...';
            document.body.appendChild(saveIndicator);
            
            // Remove after 1 second
            setTimeout(() => {
                saveIndicator.classList.remove('saving');
                setTimeout(() => {
                    if (saveIndicator.parentNode) {
                        saveIndicator.parentNode.removeChild(saveIndicator);
                    }
                }, 300);
            }, 1000);
        }
    }
    
    /**
     * Load game state from localStorage
     */
    loadGameState() {
        const savedState = localStorage.getItem('butteredUpsad_gameState');
        
        if (savedState) {
            try {
                const gameState = JSON.parse(savedState);
                
                // Load player state
                if (gameState.player && this.player) {
                    this.player.deserialize(gameState.player);
                }
                
                // Load world state
                if (gameState.world && this.world) {
                    this.world.deserialize(gameState.world);
                }
                
                // Load objects state
                if (gameState.objects && this.objectManager) {
                    this.objectManager.deserialize(gameState.objects);
                }
                
                // Load inventory state
                if (gameState.inventory && this.inventoryManager) {
                    this.inventoryManager.deserialize(gameState.inventory);
                }
                
                // Show last saved timestamp if UI manager exists
                if (this.uiManager && gameState.savedAt) {
                    const savedDate = new Date(gameState.savedAt);
                    const now = new Date();
                    const diffMs = now - savedDate;
                    const diffMins = Math.round(diffMs / 60000);
                    
                    let timeAgo;
                    if (diffMins < 1) {
                        timeAgo = 'just now';
                    } else if (diffMins === 1) {
                        timeAgo = '1 minute ago';
                    } else if (diffMins < 60) {
                        timeAgo = `${diffMins} minutes ago`;
                    } else if (diffMins < 120) {
                        timeAgo = '1 hour ago';
                    } else {
                        timeAgo = `${Math.floor(diffMins / 60)} hours ago`;
                    }
                    
                    this.uiManager.showNotification(`Game loaded (last saved ${timeAgo})`, 'info', 3000);
                }
                
                console.log('Game state loaded!');
            } catch (error) {
                console.error('Error loading game state:', error);
                
                // Show error notification if UI manager exists
                if (this.uiManager) {
                    this.uiManager.showNotification('Error loading saved game', 'error', 3000);
                }
            }
        }
        
        // Reactivity state is loaded automatically by the reactivity manager when initialized
    }
    
    /**
     * Reset game state
     */
    resetGameState() {
        localStorage.removeItem('butteredUpsad_gameState');
        localStorage.removeItem('butteredUpsad_destroyedObjects');
        localStorage.removeItem('butteredUpsad_questState');
        localStorage.removeItem('butteredUpsad_reactivityState');
        console.log('Game state reset!');
        
        // Reset reactivity state if available
        if (this.reactivityManager) {
            this.reactivityManager.resetAll();
        }
        
        // Show confirmation notification if UI manager exists
        if (this.uiManager) {
            this.uiManager.showNotification('Game progress reset', 'warning', 3000);
        }
        
        // Reload the page to start fresh
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
}

// Global game engine instance
let gameEngine = null;
