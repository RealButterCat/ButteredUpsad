# Changelog

## March 25, 2025 - UI/UX Enhancements

### Added
- New UI Manager system
  - Controls visual transitions between website and game mode
  - Provides tooltips, notifications, and user feedback
  - Manages ambient animations and subtle effects
- Keyboard Controls helper
  - Unobtrusive controls reference in corner of screen
  - Shows all keyboard commands in a togglable panel
- Auto-save system
  - Game state is automatically saved at regular intervals
  - Visual indicators for save events
  - Time-stamped save data
- Welcome hint for first-time users
  - Subtle tooltip suggests pressing Ctrl+G
  - Only appears once and remembers returning users
- Game mode indicator
  - Small, unobtrusive indicator when game mode is active
  - Animates to draw attention but remains subtle
- Enhanced hover effects
  - Subtle visual cues for interactive elements
  - Consistent feedback on game interactions
- Save/load notification system
  - Informative messages about game state
  - Non-intrusive toast notifications

### Modified
- Game Engine
  - Added UI Manager integration
  - Improved game state persistence
  - Enhanced transitions between modes
- Main.js
  - Added dynamic style injection for game UI
  - Integrated keyboard controls helper
  - Improved game toggle behavior
- CSS structure
  - Added dedicated ui.css for UI-specific styles
  - Enhanced transitions and animations
  - Implemented subtle hover effects

### Technical Details
- Used localStorage for persistent preferences
- Implemented CSS transitions for smooth UI animations
- Added subtle ambient animations that don't interfere with normal website use
- Created configurable notification and tooltip system
- Added graceful degradation for unsupported browsers

## March 25, 2025 - NPC AI Implementation

### Added
- Random wandering behavior for NPCs
  - NPCs now change direction randomly every 2-5 seconds
  - 20% chance of stopping/standing still during direction changes
  - Speed varies per NPC (random speed between 20-50 pixels/second)
- NPC-Dialog interaction
  - NPCs pause movement during conversations
  - Resume wandering after conversation ends
  - Talking state visually indicated
- Visual effects for NPC states
  - Wandering animation with subtle up/down bounce
  - Direction change animation with slight rotation
  - Talking indicator with animated ellipsis
- Boundary detection to prevent NPCs from going off-screen
- Memory management to clean up NPC wandering timers on destruction

### Modified
- NPCObject class with new methods:
  - `startWandering()`: Initializes wandering behavior
  - `changeDirection()`: Randomizes movement vector
  - `setTalking(boolean)`: Toggles conversation state
- DialogManager to handle NPC movement pausing
- CSS styles for NPC visual states
- GameObjectManager to handle NPC-specific DOM element classes

### Technical Details
- Movement implemented with simple vector math, not pathfinding algorithms
- Used setInterval for timed direction changes
- Movement calculations in `update()` method using deltaTime for smooth motion
- Random direction vectors normalized for consistent speed
- NPCs avoid edges with padding to prevent getting stuck
