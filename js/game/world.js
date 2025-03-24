/**
 * World
 * Manages the game world, including grid-based layouts, boundaries, and environment.
 */

class World {
    constructor() {
        // World dimensions
        this.gridSize = 50; // Size of each grid cell in pixels
        this.width = Math.ceil(window.innerWidth / this.gridSize);
        this.height = Math.ceil(window.innerHeight / this.gridSize);
        
        // State flags
        this.isInitialized = false;
        
        // Grid storage
        this.grid = [];
        
        // Initialize grid
        this.initializeGrid();
        
        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        
        // Event listeners
        window.addEventListener('resize', this.handleResize);
    }
    
    /**
     * Initialize grid with empty cells
     */
    initializeGrid() {
        this.grid = [];
        
        for (let y = 0; y < this.height; y++) {
            const row = [];
            
            for (let x = 0; x < this.width; x++) {
                // Default empty cell
                row.push({
                    x,
                    y,
                    type: 'empty',
                    solid: false,
                    interactive: false,
                    color: 'rgba(0, 0, 0, 0)'
                });
            }
            
            this.grid.push(row);
        }
        
        // Add some random "decorative" cells for visual interest
        this.addDecorations();
        
        this.isInitialized = true;
    }
    
    /**
     * Add decorative patterns to the grid
     */
    addDecorations() {
        // Add subtle decorative patterns to some cells
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // Add random light cells (5% chance)
                if (Math.random() < 0.05) {
                    this.grid[y][x].color = 'rgba(52, 152, 219, 0.1)';
                }
            }
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        const oldWidth = this.width;
        const oldHeight = this.height;
        
        // Update dimensions
        this.width = Math.ceil(window.innerWidth / this.gridSize);
        this.height = Math.ceil(window.innerHeight / this.gridSize);
        
        // If size changed, resize the grid
        if (oldWidth !== this.width || oldHeight !== this.height) {
            this.resizeGrid(oldWidth, oldHeight);
        }
    }
    
    /**
     * Resize grid when window size changes
     */
    resizeGrid(oldWidth, oldHeight) {
        // Create new grid with updated size
        const newGrid = [];
        
        for (let y = 0; y < this.height; y++) {
            const row = [];
            
            for (let x = 0; x < this.width; x++) {
                // Copy existing cell if within old bounds, otherwise create new empty cell
                if (x < oldWidth && y < oldHeight) {
                    row.push(this.grid[y][x]);
                } else {
                    row.push({
                        x,
                        y,
                        type: 'empty',
                        solid: false,
                        interactive: false,
                        color: 'rgba(0, 0, 0, 0)'
                    });
                }
            }
            
            newGrid.push(row);
        }
        
        this.grid = newGrid;
    }
    
    /**
     * Get grid cell at pixel coordinates
     */
    getCellAtPixel(x, y) {
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);
        
        // Check if within bounds
        if (gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height) {
            return this.grid[gridY][gridX];
        }
        
        return null;
    }
    
    /**
     * Get pixel coordinates from grid position
     */
    getPixelFromCell(gridX, gridY) {
        return {
            x: gridX * this.gridSize,
            y: gridY * this.gridSize,
            width: this.gridSize,
            height: this.gridSize
        };
    }
    
    /**
     * Set cell type at grid coordinates
     */
    setCellType(gridX, gridY, type, properties = {}) {
        // Check if within bounds
        if (gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height) {
            // Update cell with new type and properties
            Object.assign(this.grid[gridY][gridX], { type, ...properties });
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if a grid cell is solid (collision)
     */
    isCellSolid(gridX, gridY) {
        // Check if within bounds
        if (gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height) {
            return this.grid[gridY][gridX].solid;
        }
        
        // Out of bounds is considered solid
        return true;
    }
    
    /**
     * Check if pixel position collides with solid cells
     */
    collidesWithSolidCells(x, y, width, height) {
        // Convert to grid coordinates
        const gridX1 = Math.floor(x / this.gridSize);
        const gridY1 = Math.floor(y / this.gridSize);
        const gridX2 = Math.floor((x + width - 1) / this.gridSize);
        const gridY2 = Math.floor((y + height - 1) / this.gridSize);
        
        // Check each cell in the range
        for (let gridY = gridY1; gridY <= gridY2; gridY++) {
            for (let gridX = gridX1; gridX <= gridX2; gridX++) {
                if (this.isCellSolid(gridX, gridY)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Render the world grid
     */
    render(ctx) {
        // Render grid cells
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                
                // Skip empty cells
                if (cell.color === 'rgba(0, 0, 0, 0)') continue;
                
                // Draw cell
                ctx.fillStyle = cell.color;
                ctx.fillRect(
                    x * this.gridSize,
                    y * this.gridSize,
                    this.gridSize,
                    this.gridSize
                );
            }
        }
        
        // Draw grid lines (optional, can be disabled for performance)
        const drawGridLines = false;
        
        if (drawGridLines) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            
            // Vertical lines
            for (let x = 0; x <= this.width; x++) {
                ctx.beginPath();
                ctx.moveTo(x * this.gridSize, 0);
                ctx.lineTo(x * this.gridSize, this.height * this.gridSize);
                ctx.stroke();
            }
            
            // Horizontal lines
            for (let y = 0; y <= this.height; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * this.gridSize);
                ctx.lineTo(this.width * this.gridSize, y * this.gridSize);
                ctx.stroke();
            }
        }
    }
    
    /**
     * Serialize world state for saving
     */
    serialize() {
        // Only save non-empty cells to keep save data size small
        const savedCells = [];
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                
                // Skip default empty cells
                if (cell.type === 'empty' && !cell.solid && !cell.interactive) {
                    continue;
                }
                
                savedCells.push({
                    x,
                    y,
                    type: cell.type,
                    solid: cell.solid,
                    interactive: cell.interactive,
                    color: cell.color,
                    // Add any other properties that need to be saved
                });
            }
        }
        
        return {
            gridSize: this.gridSize,
            cells: savedCells
        };
    }
    
    /**
     * Deserialize world state from saved data
     */
    deserialize(data) {
        if (!data) return;
        
        // Update grid size if it changed
        if (data.gridSize) {
            this.gridSize = data.gridSize;
        }
        
        // Re-initialize the grid with empty cells
        this.initializeGrid();
        
        // Restore saved cells
        if (data.cells && Array.isArray(data.cells)) {
            data.cells.forEach(cell => {
                // Check if the cell coordinates are valid
                if (cell.x >= 0 && cell.x < this.width && cell.y >= 0 && cell.y < this.height) {
                    // Restore cell properties
                    Object.assign(this.grid[cell.y][cell.x], cell);
                }
            });
        }
    }
}
