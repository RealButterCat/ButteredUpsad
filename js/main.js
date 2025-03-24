/**
 * Main Application
 * Initializes the game and handles main interaction.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('ButteredUpsad is loading...');
    
    // Initialize game components when dom is ready
    initGame();
    
    // Add a debug reset button at top left (hidden by default)
    addDebugReset();
    
    console.log('ButteredUpsad loaded successfully!');
});

/**
 * Initialize the game
 */
function initGame() {
    // Create game engine first
    gameEngine = new GameEngine();
    console.log('Game engine created');
    
    // Create UI manager
    const uiManager = new UIManager();
    
    // Add reference to UI manager
    gameEngine.uiManager = uiManager;
    console.log('UI manager attached to game engine');
    
    // Set up quest manager
    gameEngine.questManager = new QuestManager();
    
    // Set up start game button
    const startGameButton = document.getElementById('start-game');
    
    if (startGameButton) {
        console.log('Found start game button, attaching click handler');
        
        // Remove any existing event listeners
        const newButton = startGameButton.cloneNode(true);
        startGameButton.parentNode.replaceChild(newButton, startGameButton);
        
        // Add new event listener
        newButton.addEventListener('click', function(event) {
            console.log('Start button clicked!');
            event.preventDefault();
            event.stopPropagation();
            
            // Prevent multiple clicks by disabling temporarily
            newButton.disabled = true;
            
            // Toggle game state
            toggleGame();
            
            // Re-enable after a short delay
            setTimeout(() => {
                newButton.disabled = false;
            }, 1000);
        });
    } else {
        console.error('Start game button not found!');
    }
    
    // Add keyboard shortcut (G) to toggle game
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'g' && event.ctrlKey) {
            console.log('Ctrl+G keyboard shortcut detected');
            toggleGame();
        }
    });
    
    // Handle page section changes for quest tracking
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const sectionId = link.getAttribute('href');
            if (sectionId && sectionId.startsWith('#') && gameEngine && gameEngine.questManager) {
                gameEngine.questManager.updateVisitQuests(sectionId.substring(1));
            }
        });
    });
}

/**
 * Toggle game state (start/stop)
 */
function toggleGame() {
    console.log('Toggle game function called');
    
    if (!gameEngine) {
        console.error('Game engine not found!');
        return;
    }
    
    const startGameButton = document.getElementById('start-game');
    
    if (gameEngine.isRunning) {
        console.log('Game is currently running, stopping game...');
        
        // Stop the game
        gameEngine.stop();
        
        if (startGameButton) {
            startGameButton.textContent = 'Start Game';
            startGameButton.classList.remove('active');
        }
        
        console.log('Game stopped');
    } else {
        console.log('Game is not running, starting game...');
        
        // Disable button during startup if exists
        if (startGameButton) {
            startGameButton.disabled = true;
        }
        
        // Show loading notification if UI manager exists
        let loadingNotification = null;
        if (gameEngine.uiManager) {
            loadingNotification = gameEngine.uiManager.showNotification('Loading game...', 'info', 10000);
        }
        
        // Use a timeout to simulate loading and show the notification
        setTimeout(() => {
            try {
                // Start the game
                gameEngine.start();
                
                // Spawn some initial objects
                if (gameEngine.objectManager) {
                    gameEngine.objectManager.spawnRandomObjects(15);
                }
                
                // Update button state
                if (startGameButton) {
                    startGameButton.textContent = 'Stop Game';
                    startGameButton.classList.add('active');
                    startGameButton.disabled = false;
                }
                
                // Remove loading notification and show success
                if (loadingNotification && gameEngine.uiManager) {
                    gameEngine.uiManager.removeNotification(loadingNotification);
                    gameEngine.uiManager.showNotification('Game started!', 'success');
                }
                
                console.log('Game started successfully');
            } catch (err) {
                console.error('Error starting game:', err);
                
                // Show error notification
                if (gameEngine.uiManager) {
                    gameEngine.uiManager.showNotification('Error starting game: ' + err.message, 'error');
                }
                
                // Re-enable button
                if (startGameButton) {
                    startGameButton.disabled = false;
                }
            }
        }, 500);
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
            // First confirm with user
            if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
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
 * CSS string for game-related styles that need to be added dynamically
 */
const injectGameStyles = () => {
    const styles = `
        /* Game element interactions */
        .game-interactable {
            transition: transform 0.2s, color 0.2s, opacity 0.2s;
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
        
        /* Player animations */
        .invulnerable {
            animation: invulnerable-flash 0.5s infinite alternate;
        }
        
        @keyframes invulnerable-flash {
            from { opacity: 1; }
            to { opacity: 0.5; }
        }
        
        .level-up {
            animation: level-up-glow 1s ease-in-out;
        }
        
        @keyframes level-up-glow {
            0%, 100% { box-shadow: 0 0 10px rgba(231, 76, 60, 0.5); }
            50% { box-shadow: 0 0 30px rgba(46, 204, 113, 0.8); }
        }
        
        .damaged {
            animation: damaged-flash 0.2s;
        }
        
        @keyframes damaged-flash {
            0%, 100% { background-color: #e74c3c; }
            50% { background-color: #e67e22; }
        }
        
        .dead {
            animation: dead-spin 1s ease-in-out;
            opacity: 0.5;
        }
        
        @keyframes dead-spin {
            0% { transform: rotate(0) scale(1); }
            100% { transform: rotate(720deg) scale(0); }
        }
        
        /* Object interactions */
        .interacting {
            animation: interacting-pulse 0.3s ease-in-out;
        }
        
        @keyframes interacting-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        /* Tooltip styles */
        .game-tooltip {
            position: fixed;
            background-color: rgba(44, 62, 80, 0.9);
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 14px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .game-tooltip.show {
            opacity: 1;
        }
        
        /* Context menu styles */
        .game-context-menu {
            position: fixed;
            background-color: white;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            min-width: 150px;
            z-index: 1000;
        }
        
        .game-context-menu-item {
            padding: 8px 12px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .game-context-menu-item:hover {
            background-color: #f5f5f5;
        }
        
        .game-context-menu-item.disabled {
            opacity: 0.5;
            cursor: default;
        }
        
        /* Modal styles */
        .game-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .game-modal-overlay.show {
            opacity: 1;
        }
        
        .game-modal {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
            width: 80%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.8);
            transition: transform 0.3s;
        }
        
        .game-modal.show {
            transform: scale(1);
        }
        
        /* Start game button in active state */
        #start-game.active {
            background-color: #c0392b;
        }
        
        /* Start game button hover state - add this */
        #start-game:hover {
            background-color: #c0392b;
            cursor: pointer;
        }
        
        /* Radial menu styles */
        .game-radial-menu {
            position: fixed;
            width: 0;
            height: 0;
            z-index: 500;
        }
        
        .game-radial-item {
            position: absolute;
            width: 40px;
            height: 40px;
            background-color: rgba(44, 62, 80, 0.9);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translate(-50%, -50%);
            cursor: pointer;
            transition: transform 0.2s, background-color 0.2s;
            opacity: 0;
        }
        
        .game-radial-menu.show .game-radial-item {
            opacity: 1;
        }
        
        .game-radial-item:hover {
            transform: translate(-50%, -50%) scale(1.2);
            background-color: #3498db;
        }
        
        .game-radial-tooltip {
            position: absolute;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 12px;
            white-space: nowrap;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
        }
        
        .game-radial-item:hover .game-radial-tooltip {
            opacity: 1;
        }
        
        /* Progress bar styles */
        .game-progress-container {
            position: absolute;
            padding: 5px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 4px;
        }
        
        .game-progress-label {
            color: white;
            font-size: 12px;
            margin-bottom: 3px;
        }
        
        .game-progress-bar {
            height: 8px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .game-progress-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease-out;
        }
        
        .game-progress-percentage {
            color: white;
            font-size: 10px;
            text-align: center;
            margin-top: 2px;
        }
        
        /* Completed quests container */
        .completed-quests-container {
            max-height: 500px;
            overflow-y: auto;
            transition: max-height 0.3s;
        }
        
        .completed-quests-container.collapsed {
            max-height: 0;
            overflow: hidden;
        }
        
        .completed-header {
            cursor: pointer;
            padding: 5px;
            margin-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            color: #bdc3c7;
        }
        
        .completed-header:hover {
            color: white;
        }
        
        /* Floating text for collecting items, etc. */
        .floating-text {
            position: absolute;
            font-weight: bold;
            font-size: 14px;
            text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
            pointer-events: none;
            z-index: 50;
            transform: translateX(-50%);
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
};

// Inject game styles immediately
injectGameStyles();

// Global game engine instance for easy access from all modules
let gameEngine = null;

// For debugging, expose to global scope
window.debugGame = function() {
    console.log('Game engine:', gameEngine);
    if (gameEngine) {
        console.log('Is running:', gameEngine.isRunning);
        console.log('Player:', gameEngine.player);
        console.log('Object manager:', gameEngine.objectManager);
    }
};
