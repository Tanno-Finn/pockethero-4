/**
 * Grid System
 *
 * Manages the game's grid-based world structure.
 * Handles positions and movement in a discrete grid.
 */
const Grid = (function() {
    // Grid properties
    let _cellSize = 32;
    let _width = 0;
    let _height = 0;
    let _zones = {};
    let _currentZone = null;

    // Layers of entities
    const LAYERS = {
        GROUND: 0,    // Bottom layer (tiles)
        OBJECT: 1,    // Middle layer (items, furniture)
        ACTOR: 2,     // Top layer (player, NPCs)
        UI: 3         // UI elements above everything
    };

    // Direction vectors
    const DIRECTIONS = {
        UP: { x: 0, y: -1 },
        RIGHT: { x: 1, y: 0 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 }
    };

    // Grid cells storage (by zone)
    // Format: _cells[zoneId][layer][x][y] = [entities]
    let _cells = {};

    /**
     * Initialize the grid
     *
     * @param {Object} config - Grid configuration
     * @param {number} config.cellSize - Size of grid cells in pixels
     */
    function init(config = {}) {
        _cellSize = config.cellSize || 32;

        console.log('Grid system initialized with cell size:', _cellSize);
    }

    /**
     * Create a new zone
     *
     * @param {string} zoneId - Unique zone identifier
     * @param {Object} config - Zone configuration
     * @param {number} config.width - Zone width in cells
     * @param {number} config.height - Zone height in cells
     * @param {Array} config.tiles - 2D array of tile references
     */
    function createZone(zoneId, config) {
        // Create the base zone object
        _zones[zoneId] = {
            id: zoneId,
            width: config.width,
            height: config.height,
            tiles: config.tiles || [],
            entities: []
        };

        // If tiles array is empty, initialize it with empty data
        if (!_zones[zoneId].tiles || _zones[zoneId].tiles.length === 0) {
            _zones[zoneId].tiles = [];
            for (let y = 0; y < config.height; y++) {
                _zones[zoneId].tiles[y] = [];
                for (let x = 0; x < config.width; x++) {
                    _zones[zoneId].tiles[y][x] = 'empty';
                }
            }
        }

        // Initialize cells for this zone
        _cells[zoneId] = {};
        for (const layer in LAYERS) {
            _cells[zoneId][LAYERS[layer]] = {};
        }

        // Set as current zone if no current zone is set
        if (!_currentZone) {
            _currentZone = zoneId;
            _width = config.width;
            _height = config.height;
        }

        console.log(`Created zone '${zoneId}' (${config.width}x${config.height})`);

        // Return the created zone
        return _zones[zoneId];
    }

    /**
     * Set the current active zone
     *
     * @param {string} zoneId - Zone identifier
     */
    function setCurrentZone(zoneId) {
        if (!_zones[zoneId]) {
            console.error(`Zone '${zoneId}' does not exist`);
            return false;
        }

        _currentZone = zoneId;
        _width = _zones[zoneId].width;
        _height = _zones[zoneId].height;

        // Publish zone change event
        Events.publish(Events.EVENTS.ZONE_CHANGE, {
            zoneId,
            zone: _zones[zoneId]
        });

        console.log(`Set current zone to '${zoneId}'`);
        return true;
    }

    /**
     * Get the current zone ID
     *
     * @returns {string} Current zone ID
     */
    function getCurrentZoneId() {
        return _currentZone;
    }

    /**
     * Get the current zone object
     *
     * @returns {Object} Current zone object
     */
    function getCurrentZone() {
        return _zones[_currentZone];
    }

    /**
     * Get a zone by ID
     *
     * @param {string} zoneId - Zone identifier
     * @returns {Object} Zone object
     */
    function getZone(zoneId) {
        return _zones[zoneId];
    }

    /**
     * Get all zones
     *
     * @returns {Object} All zones
     */
    function getAllZones() {
        return { ..._zones };
    }

    /**
     * Register an entity on the grid
     *
     * @param {Object} entity - Entity to register
     * @param {number} x - Grid X position
     * @param {number} y - Grid Y position
     * @param {number} layer - Grid layer
     * @param {string} zoneId - Zone ID (defaults to current zone)
     * @returns {boolean} Success
     */
    function registerEntity(entity, x, y, layer, zoneId = _currentZone) {
        if (!_zones[zoneId]) {
            console.error(`Zone '${zoneId}' does not exist`);
            return false;
        }

        // Ensure position is valid
        if (!isValidPosition(x, y, zoneId)) {
            console.error(`Invalid position (${x}, ${y}) for entity in zone '${zoneId}'`);
            return false;
        }

        // Initialize cell if it doesn't exist
        if (!_cells[zoneId][layer]) {
            _cells[zoneId][layer] = {};
        }

        if (!_cells[zoneId][layer][x]) {
            _cells[zoneId][layer][x] = {};
        }

        if (!_cells[zoneId][layer][x][y]) {
            _cells[zoneId][layer][x][y] = [];
        }

        // Add entity to cell
        _cells[zoneId][layer][x][y].push(entity);

        // Update entity position
        entity.gridX = x;
        entity.gridY = y;
        entity.layer = layer;
        entity.zoneId = zoneId;

        // Convert grid position to world position
        entity.position = {
            x: x * _cellSize + _cellSize / 2,
            y: y * _cellSize + _cellSize / 2
        };

        // Add entity to zone's entity list if not already there
        if (!_zones[zoneId].entities.includes(entity)) {
            _zones[zoneId].entities.push(entity);
        }

        // For tile entities, update the tile array as well
        if (layer === LAYERS.GROUND && entity.hasComponent && entity.hasComponent('tile')) {
            // Make sure the tile component's type is stored in the zones tiles array
            const tileComp = entity.getComponent('tile');
            if (tileComp && tileComp.type) {
                // Ensure the tiles array exists and has the right dimensions
                if (!_zones[zoneId].tiles) {
                    _zones[zoneId].tiles = [];
                }

                while (_zones[zoneId].tiles.length <= y) {
                    _zones[zoneId].tiles.push([]);
                }

                while (_zones[zoneId].tiles[y].length <= x) {
                    _zones[zoneId].tiles[y].push('empty');
                }

                // Set the tile type
                _zones[zoneId].tiles[y][x] = tileComp.type;
            }
        }

        return true;
    }

    /**
     * Unregister an entity from the grid
     *
     * @param {Object} entity - Entity to unregister
     * @returns {boolean} Success
     */
    function unregisterEntity(entity) {
        const { gridX, gridY, layer, zoneId } = entity;

        if (!zoneId || !_zones[zoneId]) {
            console.error('Entity has no valid zone ID', entity);
            return false;
        }

        // Remove from cells
        if (_cells[zoneId][layer] &&
            _cells[zoneId][layer][gridX] &&
            _cells[zoneId][layer][gridX][gridY]) {

            const index = _cells[zoneId][layer][gridX][gridY].indexOf(entity);
            if (index !== -1) {
                _cells[zoneId][layer][gridX][gridY].splice(index, 1);
            }
        }

        // Remove from zone's entity list
        const entityIndex = _zones[zoneId].entities.indexOf(entity);
        if (entityIndex !== -1) {
            _zones[zoneId].entities.splice(entityIndex, 1);
        }

        return true;
    }

    /**
     * Move an entity to a new position
     *
     * @param {Object} entity - Entity to move
     * @param {number} newX - New grid X position
     * @param {number} newY - New grid Y position
     * @returns {boolean} Success
     */
    function moveEntity(entity, newX, newY) {
        // Check if position is valid
        if (!isValidPosition(newX, newY, entity.zoneId)) {
            return false;
        }

        const { gridX, gridY, layer, zoneId } = entity;

        // Remove from old position
        if (_cells[zoneId][layer] &&
            _cells[zoneId][layer][gridX] &&
            _cells[zoneId][layer][gridX][gridY]) {

            const index = _cells[zoneId][layer][gridX][gridY].indexOf(entity);
            if (index !== -1) {
                _cells[zoneId][layer][gridX][gridY].splice(index, 1);
            }
        }

        // Add to new position
        if (!_cells[zoneId][layer][newX]) {
            _cells[zoneId][layer][newX] = {};
        }

        if (!_cells[zoneId][layer][newX][newY]) {
            _cells[zoneId][layer][newX][newY] = [];
        }

        _cells[zoneId][layer][newX][newY].push(entity);

        // Update entity position
        entity.gridX = newX;
        entity.gridY = newY;

        // Convert grid position to world position
        entity.position = {
            x: newX * _cellSize + _cellSize / 2,
            y: newY * _cellSize + _cellSize / 2
        };

        // Publish move event
        Events.publish(Events.EVENTS.ENTITY_MOVE, {
            entity,
            from: { x: gridX, y: gridY },
            to: { x: newX, y: newY }
        });

        return true;
    }

    /**
     * Get entities at a grid position
     *
     * @param {number} x - Grid X position
     * @param {number} y - Grid Y position
     * @param {number} layer - Grid layer (optional, get all layers if not specified)
     * @param {string} zoneId - Zone ID (defaults to current zone)
     * @returns {Array} Array of entities
     */
    function getEntitiesAt(x, y, layer = null, zoneId = _currentZone) {
        if (!_zones[zoneId]) {
            console.error(`Zone '${zoneId}' does not exist`);
            return [];
        }

        const entities = [];

        if (layer !== null) {
            // Get entities from specific layer
            if (_cells[zoneId][layer] &&
                _cells[zoneId][layer][x] &&
                _cells[zoneId][layer][x][y]) {

                entities.push(..._cells[zoneId][layer][x][y]);
            }
        } else {
            // Get entities from all layers
            for (const l in LAYERS) {
                const layerId = LAYERS[l];

                if (_cells[zoneId][layerId] &&
                    _cells[zoneId][layerId][x] &&
                    _cells[zoneId][layerId][x][y]) {

                    entities.push(..._cells[zoneId][layerId][x][y]);
                }
            }
        }

        return entities;
    }

    /**
     * Find entities by tag
     *
     * @param {string} tag - Tag to search for
     * @param {string} zoneId - Zone ID (defaults to current zone)
     * @returns {Array} Array of entities with the tag
     */
    function findEntitiesByTag(tag, zoneId = _currentZone) {
        if (!_zones[zoneId]) {
            console.error(`Zone '${zoneId}' does not exist`);
            return [];
        }

        return _zones[zoneId].entities.filter(entity => {
            return entity.tags && entity.tags.includes(tag);
        });
    }

    /**
     * Get the tile at a grid position
     *
     * @param {number} x - Grid X position
     * @param {number} y - Grid Y position
     * @param {string} zoneId - Zone ID (defaults to current zone)
     * @returns {Object} Tile object or null
     */
    function getTileAt(x, y, zoneId = _currentZone) {
        if (!_zones[zoneId] || !_zones[zoneId].tiles) {
            return null;
        }

        // Check bounds
        if (x < 0 || y < 0 || x >= _zones[zoneId].width || y >= _zones[zoneId].height) {
            return null;
        }

        // Safety check for undefined rows/tiles
        if (!_zones[zoneId].tiles[y]) {
            console.warn(`Missing tile row at y=${y} in zone ${zoneId}`);
            return null;
        }

        return _zones[zoneId].tiles[y][x] || null;
    }

    /**
     * Set the tile at a grid position
     *
     * @param {number} x - Grid X position
     * @param {number} y - Grid Y position
     * @param {string} tileId - Tile ID to set
     * @param {string} zoneId - Zone ID (defaults to current zone)
     * @returns {boolean} Success
     */
    function setTileAt(x, y, tileId, zoneId = _currentZone) {
        if (!_zones[zoneId] || !_zones[zoneId].tiles) {
            return false;
        }

        // Check bounds
        if (x < 0 || y < 0 || x >= _zones[zoneId].width || y >= _zones[zoneId].height) {
            return false;
        }

        // Ensure the tiles array is properly initialized
        if (!_zones[zoneId].tiles[y]) {
            _zones[zoneId].tiles[y] = [];
        }

        _zones[zoneId].tiles[y][x] = tileId;

        // Publish grid change event
        Events.publish(Events.EVENTS.GRID_CHANGED, {
            type: 'tile',
            x,
            y,
            tileId,
            zoneId
        });

        return true;
    }

    /**
     * Check if a position is valid (within bounds)
     *
     * @param {number} x - Grid X position
     * @param {number} y - Grid Y position
     * @param {string} zoneId - Zone ID (defaults to current zone)
     * @returns {boolean} True if position is valid
     */
    function isValidPosition(x, y, zoneId = _currentZone) {
        if (!_zones[zoneId]) {
            return false;
        }

        return x >= 0 && y >= 0 && x < _zones[zoneId].width && y < _zones[zoneId].height;
    }

    /**
     * Check if a position is walkable
     *
     * @param {number} x - Grid X position
     * @param {number} y - Grid Y position
     * @param {Array} requiredTags - Tags that the entity must have to walk on this tile
     * @param {Array} excludedTags - Tags that block movement
     * @param {string} zoneId - Zone ID (defaults to current zone)
     * @returns {boolean} True if position is walkable
     */
    function isWalkable(x, y, requiredTags = [], excludedTags = [], zoneId = _currentZone) {
        // Check if position is valid
        if (!isValidPosition(x, y, zoneId)) {
            console.log(`Position (${x},${y}) is not valid`);
            return false;
        }

        // Get tile at position
        const tileId = getTileAt(x, y, zoneId);

        // If no tile data, assume not walkable
        if (!tileId) {
            console.log(`No tile at position (${x},${y})`);
            return false;
        }

        // Get tile entity at this position (if available)
        const tileEntities = getEntitiesAt(x, y, LAYERS.GROUND, zoneId);
        const tileEntity = tileEntities.length > 0 ? tileEntities[0] : null;

        // Default assumption: most tiles should be walkable
        // This is a temporary fix until we properly set up all tile tags
        let walkable = true;

        // If we have a tile entity with tags, use them to determine walkability
        if (tileEntity && tileEntity.tags) {
            // Check for tiles that should block movement
            if (tileEntity.tags.includes('water') ||
                tileId === 'water' ||
                tileId === 'teleporter') {
                // For now, consider water and teleporter as non-walkable
                walkable = false;
            }

            // Check if explicitly marked as walkable (overrides other checks)
            if (tileEntity.tags.includes('walkable')) {
                walkable = true;
            }
        }

        // Check excluded tags
        if (excludedTags.length > 0 && tileEntity && tileEntity.tags) {
            for (const tag of excludedTags) {
                if (tileEntity.tags.includes(tag)) {
                    walkable = false;
                    break;
                }
            }
        }

        // Check if there are any blocking entities on object layer
        const objectEntities = getEntitiesAt(x, y, LAYERS.OBJECT, zoneId);
        for (const entity of objectEntities) {
            if (entity.tags && entity.tags.includes('solid')) {
                walkable = false;
                break;
            }
        }

        console.log(`Walkability check for (${x},${y}): ${walkable} (tile: ${tileId})`);
        return walkable;
    }

    /**
     * Convert grid coordinates to world coordinates
     *
     * @param {number} gridX - Grid X position
     * @param {number} gridY - Grid Y position
     * @returns {Object} World coordinates {x, y}
     */
    function gridToWorld(gridX, gridY) {
        return {
            x: gridX * _cellSize + _cellSize / 2,
            y: gridY * _cellSize + _cellSize / 2
        };
    }

    /**
     * Convert world coordinates to grid coordinates
     *
     * @param {number} worldX - World X position
     * @param {number} worldY - World Y position
     * @returns {Object} Grid coordinates {x, y}
     */
    function worldToGrid(worldX, worldY) {
        return {
            x: Math.floor(worldX / _cellSize),
            y: Math.floor(worldY / _cellSize)
        };
    }

    /**
     * Get all entities in a zone
     *
     * @param {string} zoneId - Zone ID (defaults to current zone)
     * @returns {Array} Array of entities
     */
    function getEntities(zoneId = _currentZone) {
        if (!_zones[zoneId]) {
            console.error(`Zone '${zoneId}' does not exist`);
            return [];
        }

        return [..._zones[zoneId].entities];
    }

    /**
     * Get grid cell size
     *
     * @returns {number} Cell size in pixels
     */
    function getCellSize() {
        return _cellSize;
    }

    /**
     * Get current zone dimensions
     *
     * @returns {Object} Zone dimensions {width, height}
     */
    function getDimensions() {
        return {
            width: _width,
            height: _height
        };
    }

    /**
     * Get grid dimensions in world coordinates
     *
     * @returns {Object} Grid dimensions {width, height}
     */
    function getWorldDimensions() {
        return {
            width: _width * _cellSize,
            height: _height * _cellSize
        };
    }

    // Public API
    return {
        // Constants
        LAYERS,
        DIRECTIONS,

        // Methods
        init,
        createZone,
        setCurrentZone,
        getCurrentZoneId,
        getCurrentZone,
        getZone,
        getAllZones,
        registerEntity,
        unregisterEntity,
        moveEntity,
        getEntitiesAt,
        findEntitiesByTag,
        getTileAt,
        setTileAt,
        isValidPosition,
        isWalkable,
        gridToWorld,
        worldToGrid,
        getEntities,
        getCellSize,
        getDimensions,
        getWorldDimensions
    };
})();