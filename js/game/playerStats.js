/**
 * PlayerStats
 * Handles tracking and displaying of player statistics.
 */

class PlayerStats {
    constructor() {
        // Basic stats
        this.stats = {
            blocksBroken: 0,
            stepsTaken: 0,
            itemsCollected: 0,
            itemsDropped: 0,
            itemsUsed: 0,
            coinsUsed: 0,
            keysUsed: 0,
            specialItemsUsed: 0,
            distanceTraveled: 0,
            interactionsPerformed: 0
        };
        
        // Cache for stat display
        this.cachedDisplay = null;
        
        // Bind methods
        this.increment = this.increment.bind(this);
        this.logToConsole = this.logToConsole.bind(this);
        this.reset = this.reset.bind(this);
        
        // Create tooltip element for stats display
        this.createStatsTooltip();
    }
    
    /**
     * Create a tooltip element to display stats
     */
    createStatsTooltip() {
        // Create tooltip if it doesn't exist
        this.tooltip = document.getElementById('stats-tooltip');
        
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.id = 'stats-tooltip';
            this.tooltip.className = 'stats-tooltip';
            document.body.appendChild(this.tooltip);
            
            // Add keyboard shortcut to toggle tooltip
            document.addEventListener('keydown', (e) => {
                if (e.key.toLowerCase() === 's' && e.ctrlKey) {
                    e.preventDefault();
                    this.toggleTooltip();
                }
            });
        }
    }
    
    /**
     * Toggle the stats tooltip visibility
     */
    toggleTooltip() {
        this.tooltip.classList.toggle('visible');
        if (this.tooltip.classList.contains('visible')) {
            this.updateTooltip();
        }
    }
    
    /**
     * Update the tooltip content
     */
    updateTooltip() {
        if (!this.tooltip) return;
        
        // Format stats for display
        let html = '<strong>PLAYER STATS</strong><br>';
        Object.entries(this.stats).forEach(([key, value]) => {
            // Format key with spaces and proper capitalization
            const formattedKey = key
                .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
            
            html += `${formattedKey}: ${Math.round(value * 100) / 100}<br>`;
        });
        
        this.tooltip.innerHTML = html;
    }
    
    /**
     * Increment a specific stat
     */
    increment(statName, amount = 1) {
        if (this.stats[statName] !== undefined) {
            this.stats[statName] += amount;
            // Update tooltip if visible
            if (this.tooltip && this.tooltip.classList.contains('visible')) {
                this.updateTooltip();
            }
            
            // Return new value
            return this.stats[statName];
        } else {
            // Create new stat if it doesn't exist
            this.stats[statName] = amount;
            return amount;
        }
    }
    
    /**
     * Get a specific stat value
     */
    getStat(statName) {
        return this.stats[statName] || 0;
    }
    
    /**
     * Reset all stats to zero
     */
    reset() {
        Object.keys(this.stats).forEach(key => {
            this.stats[key] = 0;
        });
        
        // Update tooltip if visible
        if (this.tooltip && this.tooltip.classList.contains('visible')) {
            this.updateTooltip();
        }
    }
    
    /**
     * Log all stats to console
     */
    logToConsole() {
        console.log('--- PLAYER STATS ---');
        Object.entries(this.stats).forEach(([stat, value]) => {
            console.log(`${stat}: ${value}`);
        });
        console.log('-------------------');
    }
    
    /**
     * Serialize stats for saving
     */
    serialize() {
        return { ...this.stats };
    }
    
    /**
     * Deserialize stats from saved data
     */
    deserialize(data) {
        if (!data) return;
        
        // Copy saved stats, but keep structure of default stats (allows for new stats to be added)
        this.stats = { ...this.stats, ...data };
    }
}
