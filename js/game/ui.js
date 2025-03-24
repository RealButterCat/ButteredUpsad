/**
 * UI Manager
 * Handles game UI elements like notifications, tooltips, and floating text.
 */

class UIManager {
    constructor() {
        this.notificationContainer = document.getElementById('notification-container');
        this.floatingTexts = [];
        this.notifications = [];
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize UI manager
     */
    initialize() {
        console.log('Initializing UI manager');
        
        // Create notification container if it doesn't exist
        if (!this.notificationContainer) {
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.id = 'notification-container';
            document.body.appendChild(this.notificationContainer);
        }
    }
    
    /**
     * Show a notification
     * @param {string} message - Message to show
     * @param {string} type - Notification type (success, info, warning, error)
     * @param {number} duration - Duration in milliseconds
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to container
        this.notificationContainer.appendChild(notification);
        
        // Add to tracking array
        this.notifications.push({
            element: notification,
            timer: null
        });
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Set timeout to remove notification
        const timer = setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        // Store timer reference
        this.notifications.find(n => n.element === notification).timer = timer;
        
        // Return notification for possible further handling
        return notification;
    }
    
    /**
     * Remove a notification
     */
    removeNotification(notification) {
        // Find notification in array
        const index = this.notifications.findIndex(n => n.element === notification);
        
        if (index !== -1) {
            // Clear timer if exists
            if (this.notifications[index].timer) {
                clearTimeout(this.notifications[index].timer);
            }
            
            // Remove from array
            this.notifications.splice(index, 1);
        }
        
        // Hide with animation
        notification.classList.remove('show');
        
        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    /**
     * Show floating text in game world
     * @param {string} text - Text to display
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Text color
     * @param {number} duration - Duration in milliseconds
     */
    showFloatingText(text, x, y, color = '#fff', duration = 1500) {
        // Create container if necessary
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;
        
        // Create floating text element
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = text;
        floatingText.style.left = `${x}px`;
        floatingText.style.top = `${y}px`;
        floatingText.style.color = color;
        
        // Add to game container
        gameContainer.appendChild(floatingText);
        
        // Add to tracking array
        this.floatingTexts.push({
            element: floatingText,
            timer: null
        });
        
        // Animate upward
        let progress = 0;
        const startY = y;
        const targetY = y - 50;
        const startTime = Date.now();
        const animationDuration = duration;
        
        const animate = () => {
            progress = (Date.now() - startTime) / animationDuration;
            
            if (progress >= 1) {
                // Remove element when animation completes
                this.removeFloatingText(floatingText);
                return;
            }
            
            // Calculate new position with easing
            const currentY = startY + (targetY - startY) * this.easeOutCubic(progress);
            floatingText.style.top = `${currentY}px`;
            
            // Calculate opacity (fade out towards end)
            const opacity = progress < 0.7 ? 1 : 1 - ((progress - 0.7) / 0.3);
            floatingText.style.opacity = opacity;
            
            // Continue animation
            requestAnimationFrame(animate);
        };
        
        // Start animation
        animate();
        
        return floatingText;
    }
    
    /**
     * Remove a floating text
     */
    removeFloatingText(element) {
        // Find in array
        const index = this.floatingTexts.findIndex(ft => ft.element === element);
        
        if (index !== -1) {
            // Clear timer if exists
            if (this.floatingTexts[index].timer) {
                clearTimeout(this.floatingTexts[index].timer);
            }
            
            // Remove from array
            this.floatingTexts.splice(index, 1);
        }
        
        // Remove element
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
    
    /**
     * Easing function for smoother animations
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    /**
     * Show tooltip
     * @param {HTMLElement} targetElement - Element to attach tooltip to
     * @param {string} content - Tooltip content
     * @param {string} position - Position (top, right, bottom, left)
     */
    showTooltip(targetElement, content, position = 'top') {
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = `game-tooltip position-${position}`;
        tooltip.textContent = content;
        
        // Add to document
        document.body.appendChild(tooltip);
        
        // Position tooltip relative to target
        const targetRect = targetElement.getBoundingClientRect();
        
        switch (position) {
            case 'top':
                tooltip.style.bottom = `${window.innerHeight - targetRect.top + 5}px`;
                tooltip.style.left = `${targetRect.left + targetRect.width / 2}px`;
                tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'right':
                tooltip.style.left = `${targetRect.right + 5}px`;
                tooltip.style.top = `${targetRect.top + targetRect.height / 2}px`;
                tooltip.style.transform = 'translateY(-50%)';
                break;
            case 'bottom':
                tooltip.style.top = `${targetRect.bottom + 5}px`;
                tooltip.style.left = `${targetRect.left + targetRect.width / 2}px`;
                tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'left':
                tooltip.style.right = `${window.innerWidth - targetRect.left + 5}px`;
                tooltip.style.top = `${targetRect.top + targetRect.height / 2}px`;
                tooltip.style.transform = 'translateY(-50%)';
                break;
        }
        
        // Show with animation
        setTimeout(() => {
            tooltip.classList.add('show');
        }, 10);
        
        // Return tooltip element and cleanup function
        return {
            element: tooltip,
            remove: () => {
                tooltip.classList.remove('show');
                setTimeout(() => {
                    if (tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 200);
            }
        };
    }
    
    /**
     * Update player health display
     */
    updateHealthDisplay(health, maxHealth) {
        const healthBar = document.querySelector('.health-bar');
        
        if (healthBar) {
            const percentage = (health / maxHealth) * 100;
            healthBar.style.width = `${percentage}%`;
            
            // Change color based on health
            if (percentage < 25) {
                healthBar.style.backgroundColor = '#e74c3c';
            } else if (percentage < 50) {
                healthBar.style.backgroundColor = '#f39c12';
            } else {
                healthBar.style.backgroundColor = '#2ecc71';
            }
        }
    }
    
    /**
     * Create a context menu
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Array} items - Menu items
     */
    createContextMenu(x, y, items) {
        // Remove any existing context menus
        this.removeContextMenus();
        
        // Create context menu element
        const menu = document.createElement('div');
        menu.className = 'game-context-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        
        // Add items
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'game-context-menu-item';
            
            if (item.disabled) {
                menuItem.classList.add('disabled');
            }
            
            // Add icon if specified
            if (item.icon) {
                const icon = document.createElement('span');
                icon.className = 'menu-icon';
                icon.textContent = item.icon;
                menuItem.appendChild(icon);
            }
            
            // Add label
            const label = document.createElement('span');
            label.className = 'menu-label';
            label.textContent = item.label;
            menuItem.appendChild(label);
            
            // Add click handler
            if (!item.disabled && item.action) {
                menuItem.addEventListener('click', () => {
                    item.action();
                    this.removeContextMenus();
                });
            }
            
            menu.appendChild(menuItem);
        });
        
        // Add to document
        document.body.appendChild(menu);
        
        // Add event listener to remove menu when clicking elsewhere
        const removeOnClickOutside = (event) => {
            if (!menu.contains(event.target)) {
                this.removeContextMenus();
                document.removeEventListener('click', removeOnClickOutside);
            }
        };
        
        // Delay adding the event listener to prevent immediate removal
        setTimeout(() => {
            document.addEventListener('click', removeOnClickOutside);
        }, 10);
        
        return menu;
    }
    
    /**
     * Remove all context menus
     */
    removeContextMenus() {
        const menus = document.querySelectorAll('.game-context-menu');
        menus.forEach(menu => {
            menu.parentNode.removeChild(menu);
        });
    }
    
    /**
     * Create a modal dialog
     * @param {string} title - Dialog title
     * @param {string} content - Dialog content
     * @param {Array} buttons - Dialog buttons
     */
    createModal(title, content, buttons = []) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'game-modal-overlay';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'game-modal';
        
        // Add title
        const titleElement = document.createElement('div');
        titleElement.className = 'game-modal-title';
        titleElement.textContent = title;
        modal.appendChild(titleElement);
        
        // Add content
        const contentElement = document.createElement('div');
        contentElement.className = 'game-modal-content';
        
        if (typeof content === 'string') {
            contentElement.textContent = content;
        } else if (content instanceof HTMLElement) {
            contentElement.appendChild(content);
        }
        
        modal.appendChild(contentElement);
        
        // Add buttons
        if (buttons.length > 0) {
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'game-modal-buttons';
            
            buttons.forEach(button => {
                const buttonElement = document.createElement('button');
                buttonElement.className = `game-modal-button ${button.type || 'default'}`;
                buttonElement.textContent = button.text || 'OK';
                
                buttonElement.addEventListener('click', () => {
                    if (button.action) {
                        button.action();
                    }
                    
                    // Close modal
                    this.closeModal(overlay, modal);
                });
                
                buttonsContainer.appendChild(buttonElement);
            });
            
            modal.appendChild(buttonsContainer);
        }
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'game-modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            this.closeModal(overlay, modal);
        });
        
        modal.appendChild(closeButton);
        
        // Add to document
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Show with animation
        setTimeout(() => {
            overlay.classList.add('show');
            modal.classList.add('show');
        }, 10);
        
        // Return elements and close function
        return {
            overlay,
            modal,
            close: () => this.closeModal(overlay, modal)
        };
    }
    
    /**
     * Close a modal dialog
     */
    closeModal(overlay, modal) {
        // Hide with animation
        overlay.classList.remove('show');
        modal.classList.remove('show');
        
        // Remove after animation
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
    
    /**
     * Show a progress bar
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width of progress bar
     * @param {number} progress - Progress (0-1)
     * @param {object} options - Additional options
     */
    showProgressBar(x, y, width, progress, options = {}) {
        const container = document.createElement('div');
        container.className = 'game-progress-container';
        container.style.left = `${x}px`;
        container.style.top = `${y}px`;
        container.style.width = `${width}px`;
        
        // Add label if specified
        if (options.label) {
            const label = document.createElement('div');
            label.className = 'game-progress-label';
            label.textContent = options.label;
            container.appendChild(label);
        }
        
        // Create progress bar
        const bar = document.createElement('div');
        bar.className = 'game-progress-bar';
        
        // Create progress fill
        const fill = document.createElement('div');
        fill.className = 'game-progress-fill';
        fill.style.width = `${progress * 100}%`;
        fill.style.backgroundColor = options.color || '#3498db';
        
        // Add to container
        bar.appendChild(fill);
        container.appendChild(bar);
        
        // Add percentage text if enabled
        if (options.showPercentage) {
            const percentage = document.createElement('div');
            percentage.className = 'game-progress-percentage';
            percentage.textContent = `${Math.round(progress * 100)}%`;
            container.appendChild(percentage);
        }
        
        // Add to game container
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(container);
        } else {
            document.body.appendChild(container);
        }
        
        // Return the container and update function
        return {
            element: container,
            update: (newProgress) => {
                fill.style.width = `${newProgress * 100}%`;
                
                if (options.showPercentage) {
                    container.querySelector('.game-progress-percentage').textContent = `${Math.round(newProgress * 100)}%`;
                }
            },
            remove: () => {
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            }
        };
    }
    
    /**
     * Create a radial menu (circular menu around a point)
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {Array} items - Menu items
     * @param {number} radius - Radius of the menu
     */
    createRadialMenu(x, y, items, radius = 100) {
        // Remove any existing radial menus
        this.removeRadialMenus();
        
        // Create container
        const container = document.createElement('div');
        container.className = 'game-radial-menu';
        container.style.left = `${x}px`;
        container.style.top = `${y}px`;
        
        // Calculate angles for each item
        const angleStep = (2 * Math.PI) / items.length;
        
        // Create items
        items.forEach((item, index) => {
            const angle = index * angleStep;
            
            // Calculate position
            const itemX = radius * Math.cos(angle);
            const itemY = radius * Math.sin(angle);
            
            // Create item element
            const itemElement = document.createElement('div');
            itemElement.className = 'game-radial-item';
            itemElement.style.transform = `translate(${itemX}px, ${itemY}px)`;
            
            // Add icon or text
            if (item.icon) {
                itemElement.textContent = item.icon;
            } else {
                itemElement.textContent = item.label.charAt(0);
            }
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'game-radial-tooltip';
            tooltip.textContent = item.label;
            itemElement.appendChild(tooltip);
            
            // Add click handler
            itemElement.addEventListener('click', () => {
                if (item.action) {
                    item.action();
                }
                this.removeRadialMenus();
            });
            
            container.appendChild(itemElement);
        });
        
        // Add to document
        document.body.appendChild(container);
        
        // Show with animation
        setTimeout(() => {
            container.classList.add('show');
        }, 10);
        
        // Add event listener to remove when clicking elsewhere
        const removeOnClickOutside = (event) => {
            if (!container.contains(event.target)) {
                this.removeRadialMenus();
                document.removeEventListener('click', removeOnClickOutside);
            }
        };
        
        // Delay adding the event listener
        setTimeout(() => {
            document.addEventListener('click', removeOnClickOutside);
        }, 10);
        
        return container;
    }
    
    /**
     * Remove all radial menus
     */
    removeRadialMenus() {
        const menus = document.querySelectorAll('.game-radial-menu');
        menus.forEach(menu => {
            menu.classList.remove('show');
            setTimeout(() => {
                if (menu.parentNode) {
                    menu.parentNode.removeChild(menu);
                }
            }, 300);
        });
    }
}
