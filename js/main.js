/**
 * Main Application
 * Initializes the game and handles main interaction.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('ButteredUpsad is loading...');
    
    // Initialize game components when DOM is ready
    initGame();
    
    // Add a debug reset button at top left (hidden by default)
    addDebugReset();
    
    // Initialize keyboard controls helper
    if (typeof KeyboardControls === 'function') {
        window.keyboardControls = new KeyboardControls();
    }
    
    // Preload critical assets in the background
    preloadGameAssets();
    
    console.log('ButteredUpsad loaded successfully!');
});

/**
 * Preload critical game assets
 */
function preloadGameAssets() {
    console.log('Preloading game assets...');
    
    // Create preload container (invisible)
    const preloadContainer = document.createElement('div');
    preloadContainer.style.position = 'absolute';
    preloadContainer.style.opacity = '0';
    preloadContainer.style.pointerEvents = 'none';
    preloadContainer.style.width = '0';
    preloadContainer.style.height = '0';
    preloadContainer.style.overflow = 'hidden';
    document.body.appendChild(preloadContainer);
    
    // List of assets to preload
    const assetsToPreload = [
        // Create a mini player character to preload its rendering
        createPreloadElement('div', { 
            className: 'game-object', 
            style: { 
                backgroundColor: '#e74c3c',
                borderRadius: '50%',
                width: '10px',
                height: '10px'
            }
        }),
        
        // Create a mini NPC triangle
        createPreloadElement('div', { 
            className: 'npc', 
            style: { 
                width: '0',
                height: '0',
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '10px solid #3498db'
            }
        }),
        
        // Create a mini collectible
        createPreloadElement('div', { 
            className: 'collectible', 
            style: { 
                backgroundColor: '#f1c40f',
                borderRadius: '50%',
                width: '10px',
                height: '10px'
            }
        })
    ];
    
    // Add preloaded elements to container
    assetsToPreload.forEach(el => {
        preloadContainer.appendChild(el);
    });
    
    // Clean up preloaded elements after 2 seconds
    setTimeout(() => {
        if (preloadContainer.parentNode) {
            preloadContainer.parentNode.removeChild(preloadContainer);
        }
        console.log('Preloading complete');
    }, 2000);
}

/**
 * Create a preload element with specified attributes
 */
function createPreloadElement(tagName, attrs = {}) {
    const el = document.createElement(tagName);
    
    if (attrs.className) {
        el.className = attrs.className;
    }
    
    if (attrs.style) {
        Object.keys(attrs.style).forEach(prop => {
            el.style[prop] = attrs.style[prop];
        });
    }
    
    return el;
}

/**
 * Initialize the game
 */
function initGame() {
    // Create the game engine instance
    gameEngine = new GameEngine();
    
    // Set up start game buttons
    setupStartGameButtons();
    
    // Add keyboard shortcut (G) to toggle game
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'g' && event.ctrlKey) {
            toggleGame();
        }
        
        // Handle Tab key for inventory (prevent default behavior)
        if (event.key === 'Tab' && gameEngine && gameEngine.isRunning) {
            event.preventDefault();
            
            // Toggle inventory if engine is running
            if (gameEngine.inventoryManager) {
                gameEngine.inventoryManager.toggleInventoryPanel();
            }
        }
        
        // Handle keyboard shortcuts for stats (Ctrl+S)
        if (event.key.toLowerCase() === 's' && event.ctrlKey && gameEngine && gameEngine.isRunning) {
            event.preventDefault();
            const statsEvent = new CustomEvent('toggle-player-stats');
            document.dispatchEvent(statsEvent);
        }
    });
}

/**
 * Set up all Start Game buttons
 */
function setupStartGameButtons() {
    // Nav bar button
    const navStartButton = document.getElementById('start-game');
    
    // Hero section button
    const heroStartButton = document.getElementById('hero-start-game');
    
    // Add click handlers to both buttons
    if (navStartButton) {
        navStartButton.addEventListener('click', handleStartGameClick);
    }
    
    if (heroStartButton) {
        heroStartButton.addEventListener('click', handleStartGameClick);
    }
}

/**
 * Handle click on any Start Game button
 */
function handleStartGameClick(event) {
    // Get the clicked button
    const clickedButton = event.currentTarget;
    
    // Get all start game buttons
    const navStartButton = document.getElementById('start-game');
    const heroStartButton = document.getElementById('hero-start-game');
    
    // Disable all buttons to prevent multiple clicks
    if (navStartButton) navStartButton.disabled = true;
    if (heroStartButton) heroStartButton.disabled = true;
    
    // Update button text
    clickedButton.textContent = 'Loading...';
    
    // Show subtle loading indicator
    const loadingIndicator = createLoadingIndicator();
    document.body.appendChild(loadingIndicator);
    
    // Short delay to allow for visual transition
    setTimeout(() => {
        loadingIndicator.classList.add('visible');
    }, 50);
    
    // Start game with a short delay for transition
    setTimeout(() => {
        startGame();
        
        // Remove loading indicator
        setTimeout(() => {
            loadingIndicator.classList.remove('visible');
            setTimeout(() => {
                if (loadingIndicator.parentNode) {
                    loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
            }, 300);
        }, 500);
        
        // Update buttons
        if (navStartButton) {
            navStartButton.textContent = 'Stop Game';
            navStartButton.disabled = false;
        }
        
        if (heroStartButton) {
            heroStartButton.textContent = 'Stop Game';
            heroStartButton.disabled = false;
        }
    }, 800);
}

/**
 * Create a loading indicator element
 */
function createLoadingIndicator() {
    const container = document.createElement('div');
    container.className = 'game-loading';
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    container.appendChild(spinner);
    
    const text = document.createElement('div');
    text.textContent = 'Initializing adventure...';
    container.appendChild(text);
    
    return container;
}

/**
 * Start the game with smooth transitions
 */
function startGame() {
    if (!gameEngine || gameEngine.isRunning) return;
    
    // Hide non-RPG elements
    hideWebsiteContent();
    
    // Start the game engine
    gameEngine.start();
    
    // Spawn default objects if no saved state exists
    if (!localStorage.getItem('butteredUpsad_gameState') && !sessionStorage.getItem('butteredUpsad_gameState')) {
        generateDefaultWorld();
    }
    
    // Show keyboard controls helper
    if (window.keyboardControls) {
        window.keyboardControls.show();
    }
    
    console.log('Game started');
}

/**
 * Hide regular website content
 */
function hideWebsiteContent() {
    // Add hidden class to main content sections
    document.querySelectorAll('main section, footer').forEach(el => {
        el.classList.add('website-content');
        el.classList.add('hidden');
    });
    
    // Add game-mode class to body
    document.body.classList.add('game-mode');
}

/**
 * Show regular website content
 */
function showWebsiteContent() {
    // Remove hidden class from main content sections
    document.querySelectorAll('.website-content').forEach(el => {
        el.classList.remove('hidden');
    });
    
    // Remove game-mode class from body
    document.body.classList.remove('game-mode');
}

/**
 * Generate default world with basic objects
 */
function generateDefaultWorld() {
    if (!gameEngine || !gameEngine.objectManager) return;
    
    console.log('Generating default world...');
    
    // Clear any existing objects
    gameEngine.objectManager.clearAllObjects();
    
    // Add 20 random destructible blocks
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * (window.innerWidth - 50);
        const y = Math.random() * (window.innerHeight - 200) + 100; // Keep away from top nav
        const width = 30 + Math.random() * 40;
        const height = 30 + Math.random() * 40;
        
        const block = new WallObject(x, y, width, height);
        gameEngine.objectManager.addObject(block);
    }
    
    // Add an NPC in the bottom-right corner
    const npcX = window.innerWidth - 100;
    const npcY = window.innerHeight - 100;
    const npc = new NPCObject(npcX, npcY, 'Guide');
    gameEngine.objectManager.addObject(npc);
    
    // Add a "secret" interactable element
    const secretX = 100 + Math.random() * (window.innerWidth - 200);
    const secretY = 100 + Math.random() * (window.innerHeight - 200);
    const secretObj = new CollectibleObject(secretX, secretY, 'special');
    secretObj.value = 5;
    gameEngine.objectManager.addObject(secretObj);
    
    console.log('Default world generated!');
}

/**
 * Toggle game state (start/stop)
 */
function toggleGame() {
    if (!gameEngine) return;
    
    // Get all start game buttons
    const navStartButton = document.getElementById('start-game');
    const heroStartButton = document.getElementById('hero-start-game');
    
    if (gameEngine.isRunning) {
        // Stop the game
        gameEngine.stop();
        
        // Update buttons
        if (navStartButton) {
            navStartButton.textContent = 'Start Adventure';
            navStartButton.disabled = false;
        }
        
        if (heroStartButton) {
            heroStartButton.textContent = 'Start Your Adventure';
            heroStartButton.disabled = false;
        }
        
        // Hide keyboard controls helper
        if (window.keyboardControls) {
            window.keyboardControls.hide();
        }
        
        // Show website content
        showWebsiteContent();
        
        console.log('Game stopped');
    } else {
        // Disable buttons
        if (navStartButton) navStartButton.disabled = true;
        if (heroStartButton) heroStartButton.disabled = true;
        
        // Start game with transitions
        startGame();
        
        // Update buttons
        if (navStartButton) {
            navStartButton.textContent = 'Stop Game';
            navStartButton.disabled = false;
        }
        
        if (heroStartButton) {
            heroStartButton.textContent = 'Stop Game';
            heroStartButton.disabled = false;
        }
    }
}

/**
 * Add a debug reset button
 */
function addDebugReset() {
    const resetButton = document.createElement('button');
    resetButton.id = 'debug-reset';
    resetButton.textContent = 'Reset Game';
    resetButton.style.position = 'fixed';
    resetButton.style.left = '10px';
    resetButton.style.top = '10px';
    resetButton.style.zIndex = '9999';
    resetButton.style.backgroundColor = '#e74c3c';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.padding = '5px 10px';
    resetButton.style.borderRadius = '4px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.display = 'none'; // Hidden by default
    
    resetButton.addEventListener('click', () => {
        if (gameEngine) {
            // Add confirmation dialog
            if (confirm('Are you sure you want to reset all game progress? This cannot be undone.')) {
                gameEngine.resetGameState();
            }
        }
    });
    
    document.body.appendChild(resetButton);
    
    // Show reset button with Ctrl+Shift+D
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'd' && event.ctrlKey && event.shiftKey) {
            resetButton.style.display = resetButton.style.display === 'none' ? 'block' : 'none';
        }
    });
}

/**
 * Check if localStorage is available and use sessionStorage as fallback
 */
function saveGameData(key, data) {
    try {
        localStorage.setItem(key, data);
    } catch (e) {
        console.warn('localStorage not available. Falling back to sessionStorage.');
        sessionStorage.setItem(key, data);
    }
}

/**
 * Load game data from storage with fallback
 */
function loadGameData(key) {
    // Try localStorage first
    try {
        const localData = localStorage.getItem(key);
        
        if (localData !== null) {
            return localData;
        }
    } catch (e) {
        console.warn('Error accessing localStorage:', e);
    }
    
    // Fall back to sessionStorage
    try {
        return sessionStorage.getItem(key);
    } catch (e) {
        console.warn('Error accessing sessionStorage:', e);
        return null;
    }
}

/**
 * CSS string for game-related styles that need to be added dynamically
 */
const injectGameStyles = () => {
    const styles = `
        /* Game element interactions */
        .game-interactable {
            transition: transform 0.2s, color 0.2s, opacity 0.2s;
            position: relative;
        }
        
        .game-highlight {
            box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.5);
        }
        
        .game-damaged-1 {
            opacity: 0.8;
            color: #7f8c8d !important;
        }
        
        .game-damaged-2 {
            opacity: 0.5;
            color: #95a5a6 !important;
        }
        
        .game-destroyed {
            opacity: 0.3;
            color: #bdc3c7 !important;
            text-decoration: line-through;
        }
        
        /* Website-wide effects */
        .game-invert {
            filter: invert(1);
            transition: filter 0.5s;
        }
        
        .game-shake {
            animation: website-shake 0.5s ease-in-out;
        }
        
        @keyframes website-shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        /* Special effect for powerful items */
        .special-effect {
            animation: special-pulse 2s ease-in-out;
        }
        
        @keyframes special-pulse {
            0%, 100% { filter: saturate(1); }
            50% { filter: saturate(2) brightness(1.2); }
        }
        
        /* Floating text for collectibles */
        .floating-text {
            position: absolute;
            color: white;
            font-weight: bold;
            pointer-events: none;
            transition: opacity 0.5s, transform 0.5s;
            text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
            z-index: 100;
        }
        
        /* Dragging objects */
        .dragging {
            opacity: 0.7;
            transform: scale(1.1);
            z-index: 100 !important;
        }
        
        /* Game Mode styles */
        .game-mode header {
            background-color: rgba(44, 62, 80, 0.9);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        
        /* Add hover indicator for all interactable elements */
        .game-mode .game-interactable:hover::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border: 1px dashed rgba(231, 76, 60, 0.3);
            pointer-events: none;
            z-index: 1;
            animation: border-pulse 1.5s infinite;
        }
        
        /* Disable hover indicator for specific elements */
        .game-mode header .game-interactable:hover::before,
        .game-mode footer .game-interactable:hover::before,
        .game-mode .blog-post.game-interactable:hover::before,
        .game-mode .blog-post .game-interactable:hover::before,
        .game-mode #contact.game-interactable:hover::before,
        .game-mode #contact .game-interactable:hover::before,
        .game-mode form.game-interactable:hover::before,
        .game-mode form .game-interactable:hover::before {
            display: none !important;
        }
        
        @keyframes border-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
        }
        
        /* Improved hover states for interactable elements */
        .game-interactable:hover {
            cursor: pointer;
        }
        
        /* Hide focus outlines in game mode */
        .game-mode :focus {
            outline: none !important;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
};

// Inject game styles immediately
injectGameStyles();
