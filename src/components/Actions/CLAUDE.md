# Actions System Documentation

## Overview
The Actions system provides advanced D&D combat coordination through sophisticated action sequencing, custom action building, and comprehensive template libraries. This system enables DMs to create complex, multi-step combat scenarios with conditional execution, parallel actions, and precise timing control.

**✅ IMPLEMENTATION STATUS**: **COMPLETE** (September 2025)
- All action configuration components fully implemented and tested
- Attack animation system with full D&D weapon support
- Type-safe integration with Timeline system
- Comprehensive template library with 20+ D&D action patterns
- All sequence types (Simple, Conditional, Parallel, Loop, Branch) operational

## Architecture

### Core Components
```
Actions/
├── ActionSequencer/        # Action sequence configuration and execution
│   └── ActionSequencer.tsx
├── CustomActionBuilder/    # Advanced action creation interface
│   └── CustomActionBuilder.tsx
├── ActionEditor/          # Individual action type editors
│   ├── AttackActionConfig.tsx
│   ├── InteractionActionConfig.tsx
│   └── EnvironmentalActionConfig.tsx
└── ActionRenderer/        # Action visualization components
    └── AttackRenderer.tsx
```

### Constants & Templates
```
constants/
├── sequences.ts           # Core sequencing system constants
├── templates.ts          # Pre-built D&D action template library
├── attacks.ts            # D&D weapon and attack configurations
├── environmental.ts      # Weather and terrain effect patterns
└── interactions.ts       # Object interaction definitions
```

## Action Sequencing System

### Sequence Types
The system supports five distinct sequence execution patterns:

#### 1. Simple Sequences
**Pattern**: Linear execution of actions in order
**Use Case**: Basic action combinations like "Move then Attack"
**Example**: Charge Attack (move to target, then attack with bonus damage)

#### 2. Conditional Sequences
**Pattern**: Actions execute based on success/failure of previous actions
**Use Case**: Skill checks, saving throws, attack hits/misses
**Example**: Spell Strike (cast touch spell, if successful then weapon attack)

#### 3. Parallel Sequences
**Pattern**: Multiple actions execute simultaneously
**Use Case**: Area effects, coordinated team actions
**Example**: Weather Ambush (create weather + position + attack simultaneously)

#### 4. Loop Sequences
**Pattern**: Repeat actions until condition met or count reached
**Use Case**: Full attack routines, iterative spell effects
**Example**: Full Attack (multiple attacks with cumulative penalties)

#### 5. Branch Sequences
**Pattern**: Different action paths based on conditions
**Use Case**: Complex tactical decisions, adaptive AI behavior
**Example**: Tactical Response (different actions based on enemy proximity)

### Sequence Configuration

```typescript
interface SequenceEventData {
  type: 'sequence'
  sequenceName: string
  sequenceType: 'simple' | 'conditional' | 'parallel' | 'loop' | 'branch'
  templateId?: string
  actions: SequenceAction[]
  conditions?: SequenceCondition[]
  priority: number
  maxDuration?: number
  onSuccess?: string
  onFailure?: string
  description: string
}
```

### Action Properties

```typescript
interface SequenceAction {
  id: string
  type: 'move' | 'attack' | 'spell' | 'interaction' | 'environmental'
  timing: 'immediate' | 'delayed' | 'conditional'
  priority: number
  delay?: number
  conditions?: SequenceCondition[]
  data: EventData
  modifiers?: ActionModifiers
  optional?: boolean
}
```

## ActionSequencer Component

### Purpose
Primary interface for configuring and executing action sequences within the timeline system.

### Key Features

#### Template Selection
- **Pre-built Patterns**: Choose from comprehensive D&D template library
- **Instant Loading**: Templates auto-populate sequence configuration
- **Category Filtering**: Combat, exploration, environmental, and utility categories
- **Difficulty Ratings**: Beginner, intermediate, and advanced complexity levels

#### Real-time Configuration
- **Dynamic Action List**: Add, remove, reorder, and duplicate actions
- **Live Validation**: Immediate feedback on configuration errors
- **Visual Feedback**: Color-coded action states and execution indicators
- **Timing Controls**: Precise control over action sequencing and delays

#### Execution Controls
- **Preview Mode**: Test sequences without committing to timeline
- **Status Monitoring**: Real-time execution progress and results
- **Priority Management**: Control action execution order
- **Animation Speed**: Adjust playback speed for complex sequences

### UI Components

```typescript
// Template Selection
<Select onValueChange={handleTemplateSelect}>
  {Object.entries(SEQUENCE_TEMPLATES).map(([key, template]) => (
    <SelectOption key={key} value={key}>
      {template.name}
    </SelectOption>
  ))}
</Select>

// Action Management
<Box css={{ maxHeight: '300px', overflowY: 'auto' }}>
  {sequence.actions.map((action, index) => (
    <ActionConfigPanel
      key={action.id}
      action={action}
      onUpdate={(updates) => handleActionUpdate(index, updates)}
      onRemove={() => handleRemoveAction(index)}
      onDuplicate={() => handleDuplicateAction(index)}
    />
  ))}
</Box>

// Execution Controls
<Button onClick={handleExecute} disabled={!canExecuteSequence()}>
  {isExecuting ? 'Running...' : 'Execute'}
</Button>
```

## CustomActionBuilder Component

### Purpose
Advanced interface for creating custom action sequences from scratch with comprehensive validation and import/export capabilities.

### Key Features

#### Visual Action Builder
- **Drag-and-Drop Interface**: Intuitive action arrangement
- **Component Palette**: Library of available action types
- **Connection System**: Visual representation of action dependencies
- **Real-time Preview**: Live validation and error highlighting

#### Validation System
```typescript
const validateAction = (actionData: Partial<SequenceEventData>): ValidationError[] => {
  const errors: ValidationError[] = []

  // Sequence-level validation
  if (!actionData.sequenceName?.trim()) {
    errors.push({ field: 'sequenceName', message: 'Sequence name is required' })
  }

  if (!actionData.actions || actionData.actions.length === 0) {
    errors.push({ field: 'actions', message: 'At least one action is required' })
  }

  // Action-level validation
  actionData.actions?.forEach((action, index) => {
    if (!action.type) {
      errors.push({ field: `actions.${index}.type`, message: 'Action type is required' })
    }

    if (action.timing === 'delayed' && (!action.delay || action.delay < 0)) {
      errors.push({ field: `actions.${index}.delay`, message: 'Delay must be positive for delayed actions' })
    }
  })

  return errors
}
```

#### Import/Export System
- **JSON Format**: Standards-compliant action sequence export
- **Sharing Capability**: Exchange custom actions between users
- **Version Control**: Track action modifications and iterations
- **Backup System**: Automatic local storage of work-in-progress

```typescript
// Export custom action
const exportAction = (action: SequenceEventData) => {
  const exportData = {
    version: '1.0',
    timestamp: Date.now(),
    action,
    metadata: {
      creator: 'DM',
      description: action.description,
      tags: ['custom', action.sequenceType]
    }
  }

  return JSON.stringify(exportData, null, 2)
}

// Import validation
const importAction = (jsonData: string): SequenceEventData => {
  const parsed = JSON.parse(jsonData)
  const errors = validateAction(parsed.action)

  if (errors.length > 0) {
    throw new ValidationError('Import failed', errors)
  }

  return parsed.action
}
```

## Template Library System

### Template Categories

#### Combat Templates
**Focus**: Direct combat actions and maneuvers
**Examples**:
- **Charge Attack**: Move + attack with damage bonus
- **Full Attack**: Multiple attacks with iterative penalties
- **Fighting Retreat**: Attack + defensive movement
- **Spell Strike**: Touch spell + weapon attack combo

#### Exploration Templates
**Focus**: Investigation, movement, and discovery
**Examples**:
- **Stealth Scout**: Stealthy movement + observation
- **Trap Detection**: Search + disarm sequence
- **Door Breach**: Break down + rush through

#### Environmental Templates
**Focus**: Weather, terrain, and area effects
**Examples**:
- **Weather Ambush**: Create weather + position + attack
- **Terrain Control**: Modify terrain + tactical positioning

#### Utility Templates
**Focus**: Support actions and tactical options
**Examples**:
- **Quick Heal**: Healing spell + continued action
- **Tactical Withdrawal**: Distraction + escape movement

### Template Structure

```typescript
interface ActionTemplate {
  id: string
  name: string
  category: 'combat' | 'exploration' | 'environmental' | 'utility'
  description: string
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  type: SequenceType
  estimatedDuration: number
  actions: TemplateAction[]
  loop?: LoopConfiguration
}

// Example: Charge Attack Template
const CHARGE_ATTACK = {
  id: 'charge-attack',
  name: 'Charge Attack',
  category: 'combat',
  description: 'Move to target and attack with bonus damage',
  icon: '⚔️',
  difficulty: 'beginner',
  type: 'simple',
  estimatedDuration: 2000,
  actions: [
    {
      type: 'move',
      timing: 'immediate',
      priority: 75,
      description: 'Move to target within melee range',
      modifiers: { speedBonus: 10 }
    },
    {
      type: 'attack',
      timing: 'immediate',
      priority: 50,
      description: 'Attack with charge bonus',
      conditions: [{ type: 'success' }],
      modifiers: { damageBonus: '+1d6', attackBonus: 2 }
    }
  ]
}
```

## Integration with Timeline System

### Event Type Integration
The sequence system seamlessly integrates with the existing timeline through the EventEditor:

```typescript
// EventTypeSelector.tsx - Added sequence button
<Button
  onClick={() => setEventType('sequence')}
  variant={eventType === 'sequence' ? 'primary' : 'outline'}
>
  <Play size={16} />
  Sequence
</Button>

// EventEditor.tsx - Sequence configuration
{eventType === 'sequence' && (
  <ActionSequencer
    selectedSequence={selectedSequence}
    onSequenceChange={setSelectedSequence}
  />
)}
```

### Event Creation Flow
1. **Sequence Type Selection**: Choose 'sequence' from event type selector
2. **Template or Custom**: Select pre-built template or build custom sequence
3. **Configuration**: Configure actions, timing, and conditions
4. **Validation**: Real-time validation ensures sequence integrity
5. **Preview**: Test sequence execution before adding to timeline
6. **Timeline Integration**: Sequence added as compound event to target round

### Execution Coordination
```typescript
const executeSequence = async (sequenceData: SequenceEventData) => {
  const { actions, sequenceType } = sequenceData

  switch (sequenceType) {
    case 'simple':
      for (const action of actions) {
        await executeAction(action)
        await waitForCompletion(action)
      }
      break

    case 'parallel':
      const promises = actions.map(action => executeAction(action))
      await Promise.all(promises)
      break

    case 'conditional':
      let previousResult = true
      for (const action of actions) {
        if (shouldExecute(action, previousResult)) {
          previousResult = await executeAction(action)
        }
      }
      break
  }
}
```

## Performance Considerations

### Memory Management
- **Action Cleanup**: Automatic cleanup of completed sequences
- **Template Caching**: Efficient template loading and storage
- **Animation Coordination**: Proper integration with existing animation system

### Optimization Strategies
- **Lazy Loading**: Templates loaded on-demand
- **Memoization**: Cached validation results for unchanged sequences
- **Batch Updates**: Grouped state changes during sequence execution
- **Selective Rendering**: Only re-render affected action components

### Monitoring
```typescript
// Performance tracking for sequence execution
const executeWithMetrics = async (sequence: SequenceEventData) => {
  const startTime = performance.now()
  const memoryBefore = (performance as any).memory?.usedJSHeapSize

  try {
    await executeSequence(sequence)
  } finally {
    const endTime = performance.now()
    const memoryAfter = (performance as any).memory?.usedJSHeapSize

    console.log(`Sequence "${sequence.sequenceName}" executed in ${endTime - startTime}ms`)
    if (memoryBefore && memoryAfter) {
      console.log(`Memory delta: ${memoryAfter - memoryBefore} bytes`)
    }
  }
}
```

## Error Handling & Recovery

### Validation Errors
- **Real-time Feedback**: Immediate validation on user input
- **Contextual Messages**: Specific error descriptions with suggested fixes
- **Progressive Enhancement**: Allow partial completion with warnings

### Execution Errors
- **Graceful Degradation**: Continue sequence execution even if individual actions fail
- **Rollback Support**: Ability to undo partial sequence execution
- **Error Logging**: Comprehensive error tracking for debugging

### User Experience
- **Recovery Suggestions**: Helpful error messages with action suggestions
- **Auto-save**: Preserve work-in-progress sequences
- **Undo/Redo**: Full action history for complex sequence building

## Development Guidelines

### Adding New Action Types
1. **Extend EventType Union**: Add new type to timeline.ts
2. **Create Action Config**: Build configuration UI component
3. **Add Execution Logic**: Implement action execution in roundStore
4. **Update Validation**: Add validation rules for new action type
5. **Create Templates**: Build common usage patterns
6. **Integration Testing**: Verify sequence integration

### Template Development
1. **D&D Authenticity**: Ensure templates match D&D 5e mechanics
2. **Difficulty Balance**: Appropriate complexity for target user level
3. **Performance Testing**: Verify smooth execution under load
4. **Documentation**: Clear descriptions and usage examples

### Best Practices
- **Atomic Actions**: Each action should be complete and independent
- **Predictable Timing**: Consistent duration expectations
- **Error Resilience**: Graceful handling of edge cases
- **User Feedback**: Clear status indicators throughout execution

## Future Enhancements

### Planned Features
- **AI-Assisted Building**: Smart suggestions based on D&D patterns
- **Collaborative Editing**: Multi-user sequence creation
- **Version Control**: Git-like versioning for complex sequences
- **Performance Analytics**: Execution time and success rate tracking
- **Mobile Interface**: Touch-optimized sequence building

### Extension Points
- **Plugin System**: Third-party action type support
- **Scripting Engine**: Lua/JavaScript for advanced conditionals
- **External Integrations**: D&D Beyond, Roll20 compatibility
- **Cloud Sync**: Cross-device sequence synchronization

## Troubleshooting

### Common Issues
1. **Sequence Won't Execute**: Check validation errors and action completeness
2. **Performance Lag**: Review action complexity and animation settings
3. **Validation Errors**: Ensure all required fields are populated
4. **Template Loading**: Verify template library is properly imported

### Debug Tools
```typescript
// Enable sequence debugging
const DEBUG_SEQUENCES = process.env.NODE_ENV === 'development'

if (DEBUG_SEQUENCES) {
  console.log('Executing sequence:', sequence.sequenceName)
  console.log('Actions:', sequence.actions)
  console.log('Timing configuration:', sequence.timing)
}
```

### Performance Monitoring
```typescript
// Sequence performance profiler
const profileSequence = (sequence: SequenceEventData) => {
  const profile = {
    name: sequence.sequenceName,
    actionCount: sequence.actions.length,
    estimatedDuration: sequence.estimatedDuration,
    complexity: calculateComplexity(sequence),
    memoryFootprint: estimateMemoryUsage(sequence)
  }

  console.table(profile)
}
```

The Actions system represents a significant advancement in D&D combat coordination, providing DMs with powerful tools to create sophisticated, engaging combat encounters that leverage the full depth of D&D 5e mechanics while maintaining smooth, performant execution.