# API Reference

This document provides a compact overview of all modules, functions, classes, and data schemas in the project. It serves as a quick reference to understand the codebase without examining every file in detail.

## Core Modules

### Game Engine (`js/core/game.js`)
- **Purpose**: Central game controller that manages the game state and coordinates other modules

**Public Interface**:
```javascript
Game.init(config)                // Initialize game with configuration object
Game.start()                     // Start the game
Game.pause()                     // Pause the game
Game.resume()                    // Resume a paused game
Game.gameOver()                  // End the game
Game.getGameState()              // Returns the current game state
Game.getConfig()                 // Returns the current game configuration
Game.getPlayer()                 // Returns the player entity
Game.STATES                      // Game state constants
```

### Game Loop (`js/core/loop.js`)
- **Purpose**: Manages the game timing and update/render cycle

**Public Interface**:
```javascript
GameLoop.start(updateFn, renderFn)  // Start loop with update and render callbacks
GameLoop.stop()                     // Stop the game loop
GameLoop.pause()                    // Pause the game loop
GameLoop.resume()                   // Resume a paused game loop
GameLoop.isPaused()                 // Check if loop is paused
GameLoop.getDeltaTime()             // Get time elapsed since last frame
GameLoop.setFPS(fps)                // Set target frames per second
```

### State Management (`js/core/state.js`)
- **Purpose**: Manages the game state and provides controlled access

**Public Interface**:
```javascript
StateManager.init(initialState)     // Initialize with starting state
StateManager.get(path)              // Get value at path (dot notation)
StateManager.set(path, value)       // Set value at path (dot notation)
StateManager.subscribe(path, fn)    // Subscribe to changes at path
StateManager.getState()             // Get a copy of the entire state
StateManager.reset()                // Reset state to empty or provided initial state
```

### Event System (`js/core/event.js`)
- **Purpose**: Provides a publish-subscribe pattern for communication between components

**Public Interface**:
```javascript
Events.subscribe(eventName, handler)    // Subscribe to an event
Events.publish(eventName, data)         // Publish an event
Events.clear()                          // Clear all event handlers
Events.getSubscriberCount(eventName)    // Get number of subscribers for an event
Events.EVENTS                           // Event name constants
```

### Grid System (`js/core/grid.js`)
- **Purpose**: Manages the game's grid-based world structure

**Public Interface**:
```javascript
Grid.init(config)                                   // Initialize grid with configuration
Grid.createZone(zoneId, config)                     // Create a new zone
Grid.setCurrentZone(zoneId)                         // Set the current active zone
Grid.getCurrentZoneId()                             // Get the current zone ID
Grid.getCurrentZone()                               // Get the current zone object
Grid.getZone(zoneId)                                // Get a zone by ID
Grid.getAllZones()                                  // Get all zones
Grid.registerEntity(entity, x, y, layer, zoneId)    // Register an entity on the grid
Grid.unregisterEntity(entity)                       // Unregister an entity from the grid
Grid.moveEntity(entity, newX, newY)                 // Move an entity to a new position
Grid.getEntitiesAt(x, y, layer, zoneId)             // Get entities at a grid position
Grid.findEntitiesByTag(tag, zoneId)                 // Find entities by tag
Grid.getTileAt(x, y, zoneId)                        // Get the tile at a grid position
Grid.setTileAt(x, y, tileId, zoneId)                // Set the tile at a grid position
Grid.isValidPosition(x, y, zoneId)                  // Check if a position is valid
Grid.isWalkable(x, y, reqTags, exclTags, zoneId)    // Check if a position is walkable
Grid.gridToWorld(gridX, gridY)                      // Convert grid to world coordinates
Grid.worldToGrid(worldX, worldY)                    // Convert world to grid coordinates
Grid.getEntities(zoneId)                            // Get all entities in a zone
Grid.getCellSize()                                  // Get grid cell size
Grid.getDimensions()                                // Get current zone dimensions
Grid.getWorldDimensions()                           // Get grid dimensions in world coordinates
Grid.LAYERS                                         // Layer constants
Grid.DIRECTIONS                                     // Direction vector constants
```

### Entity System (`js/core/entity.js`)
- **Purpose**: Provides entity creation, management, and component-based functionality

**Public Interface**:
```javascript
EntityManager.init()                                     // Initialize the entity manager
EntityManager.createEntity(type, config)                 // Create a new entity
EntityManager.createEntityFromTemplate(templateId, cfg)  // Create an entity from a template
EntityManager.registerTemplate(templateId, template)     // Register an entity template
EntityManager.registerComponent(type, implementation)    // Register a component type
EntityManager.getComponentImplementation(type)           // Get a component implementation
EntityManager.destroyEntity(entityOrId)                  // Destroy an entity
EntityManager.getEntity(id)                              // Get an entity by ID
EntityManager.getAllEntities()                           // Get all entities
EntityManager.findEntitiesByType(type)                   // Find entities by type
EntityManager.findEntitiesByTag(tag)                     // Find entities by tag
EntityManager.updateAll(deltaTime)                       // Update all entities
EntityManager.renderAll()                                // Render all entities
```

**Entity Methods**:
```javascript
entity.addComponent(type, config)    // Add a component to the entity
entity.removeComponent(type)         // Remove a component from the entity
entity.getComponent(type)            // Get a component from the entity
entity.hasComponent(type)            // Check if the entity has a component
entity.addTag(tag)                   // Add a tag to the entity
entity.removeTag(tag)                // Remove a tag from the entity
entity.hasTag(tag)                   // Check if the entity has a tag
entity.update(deltaTime)             // Update the entity
entity.render()                      // Render the entity
```

## Rendering System

### Renderer (`js/rendering/renderer.js`)
- **Purpose**: Handles all drawing operations on the canvas

**Public Interface**:
```javascript
Renderer.init(canvasId, width, height)          // Initialize with canvas ID and dimensions
Renderer.clear()                                 // Clear the canvas
Renderer.getWidth()                              // Get canvas width
Renderer.getHeight()                             // Get canvas height
Renderer.getContext()                            // Get canvas context
Renderer.drawText(text, x, y, options)           // Draw text
Renderer.drawRectangle(x, y, w, h, color, opt)   // Draw a rectangle
Renderer.drawCircle(x, y, radius, color, opt)    // Draw a circle
Renderer.drawLine(x1, y1, x2, y2, color, w, opt) // Draw a line
Renderer.drawTriangle(points, color, options)    // Draw a triangle
Renderer.drawGridCell(x, y, size, color, opt)    // Draw a grid cell
Renderer.drawArrow(x1, y1, x2, y2, color, opt)   // Draw an arrow
Renderer.drawImage(image, x, y, w, h, options)   // Draw an image
Renderer.save()                                  // Save current drawing state
Renderer.restore()                               // Restore previous drawing state
Renderer.translate(x, y)                         // Apply a translation
Renderer.rotate(angle)                           // Apply a rotation
Renderer.scale(x, y)                             // Apply a scale
Renderer.setAlpha(alpha)                         // Set global alpha
```

### Shapes (`js/rendering/shapes.js`)
- **Purpose**: Utility functions for drawing basic shapes

**Public Interface**:
```javascript
Shapes.rectangle(ctx, x, y, width, height, color, options)   // Draw a rectangle
Shapes.circle(ctx, x, y, radius, color, options)             // Draw a circle
Shapes.line(ctx, x1, y1, x2, y2, color, width, options)      // Draw a line
Shapes.triangle(ctx, x1, y1, x2, y2, x3, y3, color, options) // Draw a triangle
Shapes.text(ctx, text, x, y, options)                        // Draw text
Shapes.gridCell(ctx, x, y, size, color, options)             // Draw a grid cell
Shapes.arrow(ctx, x1, y1, x2, y2, color, options)            // Draw an arrow
```

### Camera (`js/rendering/camera.js`)
- **Purpose**: Manages the viewport and handles camera movement

**Public Interface**:
```javascript
Camera.init(config)                                // Initialize camera with configuration
Camera.setPosition(x, y)                           // Set camera position
Camera.getPosition()                               // Get camera position
Camera.setTarget(target)                           // Set camera target to follow
Camera.setFollowSpeed(speed)                       // Set camera follow speed
Camera.setBounds(bounds)                           // Set camera boundaries
Camera.setZoom(zoom)                               // Set camera zoom level
Camera.getZoom()                                   // Get camera zoom level
Camera.worldToScreen(worldX, worldY)               // Convert world to screen coordinates
Camera.screenToWorld(screenX, screenY)             // Convert screen to world coordinates
Camera.update(deltaTime)                           // Update camera position
Camera.apply()                                     // Apply camera transformations
Camera.revert()                                    // Revert camera transformations
Camera.isPointVisible(worldX, worldY)              // Check if a point is within viewport
Camera.isRectVisible(worldX, worldY, width, height) // Check if a rectangle is visible
```

## Input System

### Input Manager (`js/input/input-manager.js`)
- **Purpose**: Captures and normalizes user input

**Public Interface**:
```javascript
InputManager.init()                      // Initialize input manager
InputManager.cleanup()                   // Clean up event listeners
InputManager.isKeyDown(keyCode)          // Check if a key is pressed
InputManager.isActionActive(action)      // Check if an action is active
InputManager.getMousePosition()          // Get current mouse position
InputManager.isMouseButtonDown(button)   // Check if a mouse button is pressed
InputManager.mapKey(keyCode, action)     // Map a key to an action
InputManager.resetKeyMappings()          // Reset all key mappings to defaults
InputManager.KEYS                        // Key code constants
InputManager.ACTIONS                     // Game action constants
```

## Component System

### Tile Component (`js/components/tile.js`)
- **Purpose**: Defines behavior for grid tiles

**Public Interface**:
```javascript
TileComponent.init(entity, config)       // Initialize tile component
TileComponent.render(entity)             // Render the tile
TileComponent.isWalkableBy(entity)       // Check if tile is walkable by an entity
```

### Player Component (`js/components/player.js`)
- **Purpose**: Defines behavior for the player entity

**Public Interface**:
```javascript
PlayerComponent.init(entity, config)    // Initialize player component
PlayerComponent.cleanup(entity)         // Clean up resources
PlayerComponent.update(entity, dt)      // Update player entity
PlayerComponent.render(entity)          // Render player entity
PlayerComponent.move(entity, dx, dy)    // Move player in a direction
PlayerComponent.interact(entity)        // Interact with entities
```

### Interactable Component (`js/components/interactable.js`)
- **Purpose**: Defines behavior for entities that can be interacted with

**Public Interface**:
```javascript
InteractableComponent.init(entity, config)   // Initialize interactable component
InteractableComponent.cleanup(entity)        // Clean up resources
InteractableComponent.update(entity, dt)     // Update interactable entity
InteractableComponent.render(entity)         // Render interactable entity
```

## Interaction System

### Interaction Manager (`js/interactions/interaction-manager.js`)
- **Purpose**: Manages interactions between entities

**Public Interface**:
```javascript
InteractionManager.init()                              // Initialize interaction manager
InteractionManager.showDialog(text, entity, actor)     // Show a dialog
InteractionManager.closeDialog()                       // Close the dialog
InteractionManager.isDialogVisible()                   // Check if dialog is visible
InteractionManager.registerInteractionType(type, fn)   // Register an interaction type
```

## Data Management

### Data Loader (`js/data/loader.js`)
- **Purpose**: Loads and caches game data

**Public Interface**:
```javascript
DataLoader.init(config)                          // Initialize with configuration
DataLoader.loadJSON(path, validate, schemaType)  // Load data from a JSON file
DataLoader.loadMultipleJSON(specs)               // Load multiple JSON files
DataLoader.loadAllOfType(type, validate, schema) // Load all data of a specific type
DataLoader.getCache(cacheKey)                    // Get cached data
DataLoader.clearCache(cacheKey)                  // Clear data cache
DataLoader.setBasePath(path)                     // Set base path for data files
```

### Validator (`js/data/validator.js`)
- **Purpose**: Validates data against schemas

**Public Interface**:
```javascript
Validator.init()                        // Initialize validator
Validator.registerSchema(name, schema)  // Register a schema
Validator.getSchema(name)               // Get a schema by name
Validator.validate(data, schemaName)    // Validate data against a schema
Validator.getErrors()                   // Get validation errors
```

## Utility Functions

### Math Utilities (`js/utils/math.js`)
- **Purpose**: Common math operations for game development

**Public Interface**:
```javascript
MathUtils.randomInt(min, max)                   // Random integer between min and max
MathUtils.randomFloat(min, max)                 // Random float between min and max
MathUtils.clamp(value, min, max)                // Clamp value between min and max
MathUtils.distance(x1, y1, x2, y2)              // Calculate distance between points
MathUtils.manhattanDistance(x1, y1, x2, y2)     // Calculate Manhattan distance
MathUtils.lerp(a, b, t)                         // Linear interpolation
MathUtils.rectIntersect(rect1, rect2)           // Check if rectangles intersect
MathUtils.toDegrees(radians)                    // Convert radians to degrees
MathUtils.toRadians(degrees)                    // Convert degrees to radians
MathUtils.getDirection(x1, y1, x2, y2)          // Get direction vector between points
MathUtils.getCardinalDirection(x1, y1, x2, y2)  // Get cardinal direction between points
```

### Helpers (`js/utils/helpers.js`)
- **Purpose**: General utility functions

**Public Interface**:
```javascript
Helpers.generateId(prefix)             // Generate unique ID
Helpers.debounce(func, wait)           // Debounce a function
Helpers.throttle(func, limit)          // Throttle a function
Helpers.deepClone(obj)                 // Deep clone an object
Helpers.deepEqual(obj1, obj2)          // Deep equality check
Helpers.pad(num, size)                 // Format number with leading zeros
Helpers.isPlainObject(value)           // Check if value is a plain object
Helpers.colorToRGB(color)              // Convert color string to RGB object
Helpers.wait(ms)                       // Promise that resolves after ms milliseconds
```

## Data Schemas

### Zone Schema
```javascript
{
  "id": String,               // Unique zone identifier
  "name": String,             // Display name
  "width": Number,            // Zone width in tiles
  "height": Number,           // Zone height in tiles
  "tiles": [                  // 2D array of tile references
    [String, String, ...],    // Rows of tile IDs
    ...
  ],
  "entities": [               // Entities in the zone
    {
      "type": String,         // Entity type
      "x": Number,            // X position
      "y": Number,            // Y position
      "properties": Object    // Custom properties
    }
  ],
  "teleporters": [            // Teleporters to other zones
    {
      "x": Number,            // X position
      "y": Number,            // Y position
      "targetZone": String,   // Target zone ID
      "targetX": Number,      // Target X position
      "targetY": Number       // Target Y position
    }
  ]
}
```

### Tile Type Schema
```javascript
{
  "id": String,           // Unique tile type identifier
  "name": String,         // Display name
  "color": String,        // CSS color
  "shape": String,        // Shape type (rectangle, circle, triangle)
  "tags": [String],       // Property tags
  "properties": Object    // Custom properties
}
```

### Entity Type Schema
```javascript
{
  "id": String,               // Unique entity type identifier
  "name": String,             // Display name
  "color": String,            // CSS color
  "shape": String,            // Shape type (rectangle, circle, triangle)
  "size": Number,             // Size in pixels
  "tags": [String],           // Property tags
  "components": {             // Component configurations
    "componentType": {        // Component type
      // Component properties
    }
  },
  "interactionDirections": [String],  // Valid interaction directions
  "properties": Object        // Custom properties
}
```

## Constants

### Game States
```javascript
const GAME_STATES = {
  LOADING: 'loading',
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver'
};
```

### Grid Layers
```javascript
const LAYERS = {
  GROUND: 0,    // Bottom layer (tiles)
  OBJECT: 1,    // Middle layer (items, furniture)
  ACTOR: 2,     // Top layer (player, NPCs)
  UI: 3         // UI elements above everything
};
```

### Directions
```javascript
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  RIGHT: { x: 1, y: 0 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 }
};
```

### Events
```javascript
const EVENTS = {
  // Game lifecycle events
  GAME_INIT: 'game:init',
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_OVER: 'game:over',
  
  // Input events
  KEY_DOWN: 'input:keydown',
  KEY_UP: 'input:keyup',
  
  // Entity events
  ENTITY_MOVE: 'entity:move',
  ENTITY_INTERACT: 'entity:interact',
  ENTITY_SPAWN: 'entity:spawn',
  ENTITY_DESTROY: 'entity:destroy',
  
  // Grid events
  GRID_LOADED: 'grid:loaded',
  GRID_CHANGED: 'grid:changed',
  ZONE_CHANGE: 'zone:change',
  
  // UI events
  DIALOG_OPEN: 'ui:dialog:open',
  DIALOG_CLOSE: 'ui:dialog:close'
};
```

---

*Note: This document is automatically updated during development. Please do not modify manually.*