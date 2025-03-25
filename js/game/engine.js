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
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
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
        this.playerStats = {};
        
        // Auto-save timer
        this.autoSaveInterval = null;
        this.autoSaveDelay = 60000; // Save every minute
        
        // Initialize game container
        if (this.canvas) {
            this.initializeCanvas();
        }
        
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
        
        try {
            // Set up game systems with error handling
            
            // Player
            try {
                this.player = new Player(
                    window.innerWidth / 2, 
                    window.innerHeight / 2
                );
            } catch (e) {
                console.error('Error initializing Player:', e);
                this.player = null;
            }
            
            // World
            try {
                this.world = new World();
            } catch (e) {
                console.error('Error initializing World:', e);
                this.world = null;
            }
            
            // Object Manager
            try {
                this.objectManager = new GameObjectManager();
            } catch (e) {
                console.error('Error initializing GameObjectManager:', e);
                this.objectManager = null;
            }
            
            // Interaction Manager
            try {
                this.interactionManager = new InteractionManager(this);
            } catch (e) {
                console.error('Error initializing InteractionManager:', e);
                this.interactionManager = null;
            }
            
            // Inventory Manager
            try {
                if (typeof InventoryManager === 'function') {
                    this.inventoryManager = new InventoryManager();
                } else {
                    console.warn('InventoryManager class not available');
                    this.inventoryManager = null;
                }
            } catch (e) {
                console.error('Error initializing InventoryManager:', e);
                this.inventoryManager = null;
            }
            
            // Dialog Manager
            try {
                if (typeof DialogManager === 'function') {
                    this.dialogManager = new DialogManager();
                } else {
                    console.warn('DialogManager class not available');
                    this.dialogManager = null;
                }
            } catch (e) {
                console.error('Error initializing DialogManager:', e);
                this.dialogManager = null;
            }
            
            // Quest Manager
            try {
                if (typeof QuestManager === 'function') {
                    this.questManager = new QuestManager(this);
                } else {
                    console.warn('QuestManager class not available');
                    this.questManager = null;
                }
            } catch (e) {
                console.error('Error initializing QuestManager:', e);
                this.questManager = null;
            }
            
            // UI Manager
            try {
                if (typeof UIManager === 'function') {
                    this.uiManager = new UIManager(this);
                } else {
                    console.warn('UIManager class not available');
                    this.uiManager = null;
                }
            } catch (e) {
                console.error('Error initializing UIManager:', e);
                this.uiManager = null;
            }
            
            // Player Stats
            try {
                if (typeof PlayerStats === 'function') {
                    this.playerStats = new PlayerStats();
                } else {
                    console.warn('PlayerStats class not available');
                    this.playerStats = {};
                }
            } catch (e) {
                console.error('Error initializing PlayerStats:', e);
                this.playerStats = {};
            }
            
            // Reactivity Manager (must be after other systems)
            try {
                if (typeof WorldReactivity === 'function') {
                    this.reactivityManager = new WorldReactivity(this);
                } else {
                    console.warn('WorldReactivity class not available');
                    this.reactivityManager = null;
                }
            } catch (e) {
                console.error('Error initializing WorldReactivity:', e);
                this.reactivityManager = null;
            }
            
            // Load saved game state if exists
            this.loadGameState();
            
            // Show game container with subtle transition
            if (this.gameContainer) {
                this.gameContainer.classList.remove('hidden');
                setTimeout(() => {
                    this.gameContainer.classList.add('active');
                }, 50);
            }
            
            // Start game loop
            this.isRunning = true;
            requestAnimationFrame(this.gameLoop);
            
            // Initialize interactions
            if (this.interactionManager) {
                this.interactionManager.initialize();
            }
            
            // Start auto-save
            this.startAutoSave();
            
            // Transition UI to game mode
            if (this.uiManager) {
                this.uiManager.transitionToGameMode();
            }
            
            console.log('Game engine started!');
        } catch (error) {
            console.error('Error starting game engine:', error);
            this.showErrorMessage('Failed to start game. Check console for details.');
        }
    }
    
    /**
     * Show an error message to the user
     */
    showErrorMessage(message) {
        // Create error message element
        const errorBox = document.createElement('div');
        errorBox.style.position = 'fixed';
        errorBox.style.top = '50%';
        errorBox.style.left = '50%';
        errorBox.style.transform = 'translate(-50%, -50%)';
        errorBox.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
        errorBox.style.color = 'white';
        errorBox.style.padding = '20px';
        errorBox.style.borderRadius = '5px';
        errorBox.style.zIndex = '9999';
        errorBox.style.maxWidth = '500px';
        errorBox.style.textAlign = 'center';
        
        errorBox.innerHTML = `
            <h3>Game Error</h3>
            <p>${message}</p>
            <p>Try refreshing the page or checking your browser console.</p>
            <button id="error-close" style="background: white; color: #e74c3c; border: none; padding: 5px 15px; border-radius: 3px; margin-top: 10px; cursor: pointer;">Close</button>
        `;
        
        document.body.appendChild(errorBox);
        
        // Add close button functionality
        const closeButton = document.getElementById('error-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                if (errorBox.parentNode) {
                    errorBox.parentNode.removeChild(errorBox);
                }
            });
        }
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
        if (this.gameContainer) {
            this.gameContainer.classList.remove('active');
            setTimeout(() => {
                this.gameContainer.classList.add('hidden');
            }, 300);
        }
        
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
        if (!this.ctx) return;
        
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
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
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
        try {
            const gameState = {
                player: this.player ? this.player.serialize() : null,
                world: this.world ? this.world.serialize() : null,
                objects: this.objectManager ? this.objectManager.serialize() : null,
                inventory: this.inventoryManager ? this.inventoryManager.serialize() : null,
                savedAt: new Date().toISOString()
            };
            
            // Try localStorage first, fall back to sessionStorage
            try {
                localStorage.setItem('butteredUpsad_gameState', JSON.stringify(gameState));
            } catch (e) {
                console.warn('localStorage not available. Falling back to sessionStorage.');
                sessionStorage.setItem('butteredUpsad_gameState', JSON.stringify(gameState));
            }
            
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
        } catch (error) {
            console.error('Error saving game state:', error);
        }
    }
    
    /**
     * Load game state from localStorage
     */
    loadGameState() {
        let savedState = null;
        
        // Try localStorage first, then sessionStorage
        try {
            savedState = localStorage.getItem('butteredUpsad_gameState');
            if (!savedState) {
                savedState = sessionStorage.getItem('butteredUpsad_gameState');
            }
        } catch (e) {
            console.warn('Error accessing storage:', e);
            return;
        }
        
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
        try {
            localStorage.removeItem('butteredUpsad_gameState');
            localStorage.removeItem('butteredUpsad_destroyedObjects');
            localStorage.removeItem('butteredUpsad_questState');
            localStorage.removeItem('butteredUpsad_reactivityState');
        } catch (e) {
            console.warn('Error accessing localStorage:', e);
        }
        
        try {
            sessionStorage.removeItem('butteredUpsad_gameState');
            sessionStorage.removeItem('butteredUpsad_destroyedObjects');
            sessionStorage.removeItem('butteredUpsad_questState');
            sessionStorage.removeItem('butteredUpsad_reactivityState');
        } catch (e) {
            console.warn('Error accessing sessionStorage:', e);
        }
        
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
