# Design Document

## Architecture Overview

This project follows a modular, component-based architecture to ensure separation of concerns, maintainability, and data-driven design.

### Core Systems

#### Game Engine
The central component that coordinates all game systems, manages the game state, and controls the game loop.

#### Grid System
Manages the game's grid-based world structure, handling positions and movement in a discrete grid.

#### Entity System
A component-based entity system that defines all game objects (player, NPCs, items, furniture) and their behaviors.

#### Renderer
Handles all drawing operations on the canvas, including tiles, entities, and UI elements.

#### Input Manager
Captures and processes user input (WASD for movement, E for interaction).

#### Event System
Facilitates communication between components through a publish-subscribe pattern.

#### Camera System
Controls the visible portion of the game world, following the player when needed.

#### Data Manager
Loads, validates, and provides access to game data stored in JSON format.

#### Interaction System
Manages interactions between entities, based on direction, tags, and custom rules.

### Architecture Diagram

```
┌─────────────────┐      ┌──────────────┐      ┌──────────────┐
│   Game Engine   │<─────│ Input Manager │      │ Data Manager │
└───────┬─────────┘      └──────────────┘      └──────┬───────┘
        │                        ▲                     │
        ▼                        │                     ▼
┌───────┴─────────┐      ┌──────┴───────┐      ┌──────┴───────┐
│   Grid System   │<─────│ Event System │<─────│ Entity System │
└───────┬─────────┘      └──────────────┘      └──────┬───────┘
        │                        ▲                     │
        ▼                        │                     ▼
┌───────┴─────────┐      ┌──────┴───────┐      ┌──────┴───────┐
│ Camera System   │─────>│   Renderer   │<─────│ Interaction  │
└─────────────────┘      └──────────────┘      │    System    │
                                               └──────────────┘
```

## Design Decisions

### Grid-Based World
- The world is divided into a grid of tiles
- Entities move in discrete steps on this grid
- Each grid cell can contain one ground tile and multiple entities in different layers

### Component-Based Entity System
- Entities are composed of reusable components
- Common components include: Position, Renderer, Interactable, Movable
- Components define behavior and properties rather than inheritance hierarchies

### Tag System
- Entities and tiles have tags that define their properties and capabilities
- Tags are used to determine valid interactions and movement rules
- Example tags: "walkable", "solid", "interactable", "water"

### Data-Driven Design
- Game content is defined in JSON files separated from code
- Tile types, entity types, and interaction rules are all data-driven
- New content can be added without modifying code

### Direction-Based Interaction
- Interactions depend on the relative direction between entities
- Each interactable entity defines from which directions it can be interacted with
- Interaction triggers events that components can listen to

### Layered Rendering
- The game world is rendered in layers: background, ground, objects, entities, UI
- Each layer is rendered separately to ensure proper z-ordering

### Camera System
- Camera follows the player entity
- Camera has configurable boundaries and behavior
- Smooth transitions between camera positions

### Zone Management
- The game world is divided into zones (separate grid areas)
- Teleporters allow movement between zones
- Each zone has its own grid and entities

## Data Schemas

### Zone Schema
```json
{
  "id": "string",             // Unique zone identifier
  "name": "string",           // Display name
  "width": "number",          // Zone width in tiles
  "height": "number",         // Zone height in tiles
  "tiles": [                  // 2D array of tile references
    ["tileType1", "tileType2", ...],
    [...]
  ],
  "entities": [               // Entities in the zone
    {
      "type": "string",       // Entity type
      "x": "number",          // X position
      "y": "number",          // Y position
      "properties": {}        // Custom properties
    }
  ],
  "teleporters": [            // Teleporters to other zones
    {
      "x": "number",          // X position
      "y": "number",          // Y position
      "targetZone": "string", // Target zone ID
      "targetX": "number",    // Target X position
      "targetY": "number"     // Target Y position
    }
  ]
}
```

### Tile Type Schema
```json
{
  "id": "string",           // Unique tile type identifier
  "name": "string",         // Display name
  "color": "string",        // CSS color
  "shape": "string",        // Shape type (rect, circle)
  "tags": ["string"],       // Property tags
  "properties": {}          // Custom properties
}
```

### Entity Type Schema
```json
{
  "id": "string",           // Unique entity type identifier
  "name": "string",         // Display name
  "color": "string",        // CSS color
  "shape": "string",        // Shape type (rect, circle)
  "size": "number",         // Size in pixels
  "tags": ["string"],       // Property tags
  "components": [           // Component configurations
    {
      "type": "string",     // Component type
      "properties": {}      // Component properties
    }
  ],
  "interactionDirections": ["up", "down", "left", "right"], // Valid interaction directions
  "properties": {}          // Custom properties
}
```

## Future Considerations

- Add support for entity animation
- Implement a basic inventory system
- Add support for entity AI and pathfinding
- Implement a quest/mission system
- Add day/night cycle or weather effects