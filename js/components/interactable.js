/**
 * Interactable Component
 *
 * Defines behavior for entities that can be interacted with.
 * Handles interaction logic and visualization.
 */
const InteractableComponent = (function() {
    /**
     * Initialize interactable component
     *
     * @param {Object} entity - Entity this component belongs to
     * @param {Object} config - Component configuration
     */
    function init(entity, config) {
        this.interactionType = config.interactionType || 'basic';
        this.validDirections = config.validDirections || ['up', 'right', 'down', 'left'];
        this.interactionData = config.interactionData || {};
        this.highlightColor = config.highlightColor || '#f1c40f';
        this.highlightAlpha = 0.6;
        this.isHighlighted = false;
        this.showDirectionIndicators = config.showDirectionIndicators !== false;

        // Add interactable tag
        entity.addTag('interactable');

        // Create handler function for interaction
        const handleInteraction = (data) => {
            // Check if this entity is the target
            if (data.target.id !== entity.id) {
                return;
            }

            // Check if interaction direction is valid
            if (!this.validDirections.includes(data.direction)) {
                console.log(`Cannot interact with ${entity.type} from direction: ${data.direction}`);
                return;
            }

            // Handle interaction based on type
            switch (this.interactionType) {
                case 'dialog':
                    _handleDialogInteraction(this, entity, data);
                    break;

                case 'pickup':
                    _handlePickupInteraction(this, entity, data);
                    break;

                case 'teleport':
                    _handleTeleportInteraction(this, entity, data);
                    break;

                case 'toggle':
                    _handleToggleInteraction(this, entity, data);
                    break;

                case 'custom':
                    // Call custom handler if provided
                    if (this.interactionData.handler) {
                        this.interactionData.handler(entity, data);
                    }
                    break;

                default:
                    // Basic interaction - just trigger an event
                    Events.publish('interaction:basic', {
                        entity,
                        actor: data.actor
                    });
                    break;
            }

            // Flash highlight
            this.isHighlighted = true;
            setTimeout(() => {
                this.isHighlighted = false;
            }, 300);
        };

        // Subscribe to interaction events
        this._interactionHandler = Events.subscribe(
            Events.EVENTS.ENTITY_INTERACT,
            handleInteraction
        );
    }

    /**
     * Clean up resources when component is removed
     *
     * @param {Object} entity - Entity this component belongs to
     */
    function cleanup(entity) {
        // Unsubscribe from events
        if (this._interactionHandler) {
            this._interactionHandler();
        }

        // Remove interactable tag
        entity.removeTag('interactable');
    }

    /**
     * Handle dialog interaction
     *
     * @param {Object} component - Interactable component
     * @param {Object} entity - Entity this component belongs to
     * @param {Object} data - Interaction data
     * @private
     */
    function _handleDialogInteraction(component, entity, data) {
        const dialogText = component.interactionData.text || `Interacted with ${entity.type}`;

        // Publish dialog open event
        Events.publish(Events.EVENTS.DIALOG_OPEN, {
            entity,
            actor: data.actor,
            text: dialogText
        });
    }

    /**
     * Handle pickup interaction
     *
     * @param {Object} component - Interactable component
     * @param {Object} entity - Entity this component belongs to
     * @param {Object} data - Interaction data
     * @private
     */
    function _handlePickupInteraction(component, entity, data) {
        // Publish pickup event
        Events.publish('interaction:pickup', {
            entity,
            actor: data.actor,
            item: component.interactionData.item
        });

        // Remove entity from grid
        Grid.unregisterEntity(entity);

        // Destroy entity
        EntityManager.destroyEntity(entity);
    }

    /**
     * Handle teleport interaction
     *
     * @param {Object} component - Interactable component
     * @param {Object} entity - Entity this component belongs to
     * @param {Object} data - Interaction data
     * @private
     */
    function _handleTeleportInteraction(component, entity, data) {
        const targetZone = component.interactionData.targetZone;
        const targetX = component.interactionData.targetX;
        const targetY = component.interactionData.targetY;

        if (!targetZone || targetX === undefined || targetY === undefined) {
            console.error('Teleport interaction missing target data');
            return;
        }

        // Change zone if needed
        if (targetZone !== data.actor.zoneId) {
            // Unregister from current zone
            Grid.unregisterEntity(data.actor);

            // Set current zone
            Grid.setCurrentZone(targetZone);

            // Register in new zone
            data.actor.zoneId = targetZone;
            Grid.registerEntity(data.actor, targetX, targetY, data.actor.layer, targetZone);
        } else {
            // Just move within same zone
            Grid.moveEntity(data.actor, targetX, targetY);
        }

        // Update player position immediately
        const worldPos = Grid.gridToWorld(targetX, targetY);
        data.actor.position.x = worldPos.x;
        data.actor.position.y = worldPos.y;

        // Reset player movement
        if (data.actor.getComponent('player')) {
            const playerComp = data.actor.getComponent('player');
            playerComp.isMoving = false;
            playerComp.targetX = targetX;
            playerComp.targetY = targetY;
        }
    }

    /**
     * Handle toggle interaction
     *
     * @param {Object} component - Interactable component
     * @param {Object} entity - Entity this component belongs to
     * @param {Object} data - Interaction data
     * @private
     */
    function _handleToggleInteraction(component, entity, data) {
        // Toggle state
        component.interactionData.state = !component.interactionData.state;

        // Publish toggle event
        Events.publish('interaction:toggle', {
            entity,
            actor: data.actor,
            state: component.interactionData.state
        });
    }

    /**
     * Update interactable
     *
     * @param {Object} entity - Entity this component belongs to
     * @param {number} deltaTime - Time since last update in seconds
     */
    function update(entity, deltaTime) {
        // Nothing to update by default
    }

    /**
     * Render interactable
     *
     * @param {Object} entity - Entity this component belongs to
     */
    function render(entity) {
        const cellSize = Grid.getCellSize();

        // Draw highlight if needed
        if (this.isHighlighted) {
            Renderer.save();
            Renderer.setAlpha(this.highlightAlpha);

            Renderer.drawRectangle(
                entity.position.x - cellSize / 2,
                entity.position.y - cellSize / 2,
                cellSize,
                cellSize,
                this.highlightColor
            );

            Renderer.restore();
        }

        // Draw direction indicators if enabled
        if (this.showDirectionIndicators) {
            const indicatorSize = 3;
            const indicatorDistance = cellSize / 2 - 2;

            Renderer.save();

            for (const direction of this.validDirections) {
                let indicatorX = entity.position.x;
                let indicatorY = entity.position.y;

                switch (direction) {
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
                    this.highlightColor
                );
            }

            Renderer.restore();
        }
    }

    // Public API
    return {
        init,
        cleanup,
        update,
        render
    };
})();

// Register component with entity manager
EntityManager.registerComponent('interactable', InteractableComponent);