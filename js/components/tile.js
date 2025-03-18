/**
 * Tile Component
 *
 * Defines behavior for grid tiles.
 * Handles rendering and tile-specific properties.
 */
const TileComponent = (function() {
    /**
     * Initialize tile component
     *
     * @param {Object} entity - Entity this component belongs to
     * @param {Object} config - Component configuration
     */
    function init(entity, config) {
        this.type = config.type || 'unknown';
        this.color = config.color || '#000000';
        this.shape = config.shape || 'rectangle';

        // Default: assume all tiles are walkable unless specifically configured otherwise
        this.walkable = config.walkable !== undefined ? config.walkable : true;

        this.propertyTags = config.propertyTags || [];

        // Add tags from tile properties
        if (this.walkable) {
            entity.addTag('walkable');
        }

        // Add custom property tags to entity
        for (const tag of this.propertyTags) {
            entity.addTag(tag);
        }

        // For debugging
        console.log(`Created tile: ${this.type}, walkable: ${this.walkable}, tags: ${this.propertyTags.join(', ')}`);
    }

    /**
     * Render the tile
     *
     * @param {Object} entity - Entity to render
     */
    function render(entity) {
        const cellSize = Grid.getCellSize();
        const x = entity.position.x - cellSize / 2;
        const y = entity.position.y - cellSize / 2;

        // Draw tile based on shape
        switch (this.shape) {
            case 'rectangle':
                Renderer.drawRectangle(x, y, cellSize, cellSize, this.color, {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        width: 1
                    }
                });
                break;

            case 'circle':
                Renderer.drawCircle(
                    entity.position.x,
                    entity.position.y,
                    cellSize / 2 * 0.8, // Slightly smaller than cell
                    this.color
                );
                break;

            case 'triangle':
                // Draw a triangle with base at the bottom
                Renderer.drawTriangle(
                    x + cellSize / 2, y, // Top
                    x, y + cellSize, // Bottom left
                    x + cellSize, y + cellSize, // Bottom right
                    this.color
                );
                break;

            default:
                // Default to rectangle
                Renderer.drawRectangle(x, y, cellSize, cellSize, this.color);
                break;
        }
    }

    /**
     * Check if the tile is walkable by an entity
     *
     * @param {Object} entity - Entity checking for walkability
     * @returns {boolean} True if walkable
     */
    function isWalkableBy(entity) {
        // Base walkability
        if (!this.walkable) {
            return false;
        }

        // Check if entity has required tags
        if (this.requiredTags && this.requiredTags.length > 0) {
            for (const tag of this.requiredTags) {
                if (!entity.hasTag(tag)) {
                    return false;
                }
            }
        }

        return true;
    }

    // Public API
    return {
        init,
        render,
        isWalkableBy
    };
})();

// Register component with entity manager
EntityManager.registerComponent('tile', TileComponent);