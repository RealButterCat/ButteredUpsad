# Changelog

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
