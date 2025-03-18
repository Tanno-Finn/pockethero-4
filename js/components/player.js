/**
 * Player Component
 *
 * Defines behavior for the player entity.
 * Handles movement, interaction, and player-specific properties.
 */
const PlayerComponent = (function() {
    /**
     * Initialize player component
     *
     * @param {Object} entity - Entity this component belongs to
     * @param {Object} config - Component configuration
     */
    function init(entity, config) {
        this.color = config.color || '#3498db';
        this.size = config.size || Grid.getCellSize() * 0.8;
        this.shape = config.shape || 'circle';
        this.speed = config.speed || 5; // Grid cells per second
        this.direction = config.direction || 'down';
        this.canMove = true;
        this.interactionRange = config.interactionRange || 1;
        this.movementCooldown = 0;
        this.isMoving = false;
        this.targetX = entity.gridX;
        this.targetY = entity.gridY;

        // Add player tag
        entity.addTag('player');

        // Subscribe to input events
        this._moveUpHandler = Events.subscribe(Events.EVENTS.KEY_DOWN, this._handleInput.bind(this, entity));
    }

    /**
     * Clean up resources when component is removed
     *
     * @param {Object} entity - Entity this component belongs to
     */
    function cleanup(entity) {
        // Unsubscribe from events
        if (this._moveUpHandler) {
            this._moveUpHandler();
        }
    }

    /**
     * Handle input events
     *
     * @param {Object} entity - Player entity
     * @param {Object} data - Event data
     * @private
     */
    function _handleInput(entity, data) {
        if (!this.canMove || this.isMoving) {
            return;
        }

        // Movement
        if (data.action === InputManager.ACTIONS.MOVE_UP) {
            this.move(entity, 0, -1);
            this.direction = 'up';
        } else if (data.action === InputManager.ACTIONS.MOVE_RIGHT) {
            this.move(entity, 1, 0);
            this.direction = 'right';
        } else if (data.action === InputManager.ACTIONS.MOVE_DOWN) {
            this.move(entity, 0, 1);
            this.direction = 'down';
        } else if (data.action === InputManager.ACTIONS.MOVE_LEFT) {
            this.move(entity, -1, 0);
            this.direction = 'left';
        }

        // Interaction
        if (data.action === InputManager.ACTIONS.INTERACT) {
            this.interact(entity);
        }
    }

    /**
     * Move the player
     *
     * @param {Object} entity - Player entity
     * @param {number} dx - X movement (-1, 0, 1)
     * @param {number} dy - Y movement (-1, 0, 1)
     */
    function move(entity, dx, dy) {
        const newX = entity.gridX + dx;
        const newY = entity.gridY + dy;

        // Check if move is valid
        if (!Grid.isWalkable(newX, newY, [], ['solid'])) {
            return;
        }

        // Set movement target
        this.targetX = newX;
        this.targetY = newY;
        this.isMoving = true;

        // Move entity on grid
        Grid.moveEntity(entity, newX, newY);
    }

    /**
     * Interact with entities in front of the player
     *
     * @param {Object} entity - Player entity
     */
    function interact(entity) {
        // Determine interaction position based on direction
        let interactX = entity.gridX;
        let interactY = entity.gridY;

        switch (this.direction) {
            case 'up':
                interactY -= this.interactionRange;
                break;
            case 'right':
                interactX += this.interactionRange;
                break;
            case 'down':
                interactY += this.interactionRange;
                break;
            case 'left':
                interactX -= this.interactionRange;
                break;
        }

        // Get entities at interaction position
        const entities = Grid.getEntitiesAt(interactX, interactY);

        // Find interactable entities
        const interactables = entities.filter(e =>
            e.hasTag('interactable') &&
            e.id !== entity.id
        );

        if (interactables.length > 0) {
            // Trigger interaction event on the first interactable entity
            Events.publish(Events.EVENTS.ENTITY_INTERACT, {
                actor: entity,
                target: interactables[0],
                direction: this.direction
            });
        }
    }

    /**
     * Update player
     *
     * @param {Object} entity - Player entity
     * @param {number} deltaTime - Time since last update in seconds
     */
    function update(entity, deltaTime) {
        // Update movement cooldown
        if (this.movementCooldown > 0) {
            this.movementCooldown -= deltaTime;
        }

        // Smooth movement towards target
        if (this.isMoving) {
            const targetWorldPos = Grid.gridToWorld(this.targetX, this.targetY);
            const distanceX = targetWorldPos.x - entity.position.x;
            const distanceY = targetWorldPos.y - entity.position.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < 1) {
                // Arrived at target
                entity.position.x = targetWorldPos.x;
                entity.position.y = targetWorldPos.y;
                this.isMoving = false;
                this.movementCooldown = 0.1; // Small cooldown between moves
            } else {
                // Move towards target
                const speed = this.speed * Grid.getCellSize() * deltaTime;
                const moveX = distanceX / distance * Math.min(speed, distance);
                const moveY = distanceY / distance * Math.min(speed, distance);

                entity.position.x += moveX;
                entity.position.y += moveY;
            }
        }
    }

    /**
     * Render player
     *
     * @param {Object} entity - Player entity
     */
    function render(entity) {
        // Draw player based on shape
        switch (this.shape) {
            case 'circle':
                Renderer.drawCircle(
                    entity.position.x,
                    entity.position.y,
                    this.size / 2,
                    this.color,
                    {
                        stroke: {
                            color: '#2980b9',
                            width: 2
                        }
                    }
                );
                break;

            case 'rectangle':
                Renderer.drawRectangle(
                    entity.position.x - this.size / 2,
                    entity.position.y - this.size / 2,
                    this.size,
                    this.size,
                    this.color,
                    {
                        stroke: {
                            color: '#2980b9',
                            width: 2
                        }
                    }
                );
                break;

            case 'triangle':
                // Draw triangle pointing in movement direction
                const halfSize = this.size / 2;

                let p1, p2, p3;

                switch (this.direction) {
                    case 'up':
                        p1 = { x: entity.position.x, y: entity.position.y - halfSize };
                        p2 = { x: entity.position.x - halfSize, y: entity.position.y + halfSize };
                        p3 = { x: entity.position.x + halfSize, y: entity.position.y + halfSize };
                        break;
                    case 'right':
                        p1 = { x: entity.position.x + halfSize, y: entity.position.y };
                        p2 = { x: entity.position.x - halfSize, y: entity.position.y - halfSize };
                        p3 = { x: entity.position.x - halfSize, y: entity.position.y + halfSize };
                        break;
                    case 'down':
                        p1 = { x: entity.position.x, y: entity.position.y + halfSize };
                        p2 = { x: entity.position.x - halfSize, y: entity.position.y - halfSize };
                        p3 = { x: entity.position.x + halfSize, y: entity.position.y - halfSize };
                        break;
                    case 'left':
                        p1 = { x: entity.position.x - halfSize, y: entity.position.y };
                        p2 = { x: entity.position.x + halfSize, y: entity.position.y - halfSize };
                        p3 = { x: entity.position.x + halfSize, y: entity.position.y + halfSize };
                        break;
                }

                Renderer.drawTriangle(
                    p1.x, p1.y,
                    p2.x, p2.y,
                    p3.x, p3.y,
                    this.color,
                    {
                        stroke: {
                            color: '#2980b9',
                            width: 2
                        }
                    }
                );
                break;
        }

        // Draw direction indicator
        const indicatorSize = 4;
        const indicatorDistance = this.size / 2 + 2;

        let indicatorX = entity.position.x;
        let indicatorY = entity.position.y;

        switch (this.direction) {
            case 'up':
                indicatorY -= indicatorDistance;
                break;
            case 'right':
                indicatorX += indicatorDistance;
                break;
            case 'down':
                indicatorY += indicatorDistance;
                break;
            case 'left':
                indicatorX -= indicatorDistance;
                break;
        }

        Renderer.drawCircle(
            indicatorX,
            indicatorY,
            indicatorSize,
            '#e74c3c'
        );
    }

    // Public API
    return {
        init,
        cleanup,
        update,
        render,
        move,
        interact
    };
})();

// Register component with entity manager
EntityManager.registerComponent('player', PlayerComponent);