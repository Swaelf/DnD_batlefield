# Visual Testing System Documentation

## Overview
The Visual Testing System provides automated visual regression testing and bug detection for the MapMaker application. It captures screenshots, runs predefined test scenarios, detects visual bugs, and generates comprehensive HTML reports.

## Features

### 1. **Automated Screenshot Capture**
- Capture full canvas screenshots at 2x resolution
- Capture specific regions of the canvas
- Sequential capture for animations
- State snapshots alongside visual captures

### 2. **Test Scenario Runner**
- Predefined test scenarios for common workflows
- Support for actions, assertions, waits, and captures
- Categories: movement, spells, selection, combat, visual
- Automatic cleanup after test completion

### 3. **Visual Assertions**
- Element presence and visibility checks
- Position and size validation
- Color and opacity verification
- Animation state tracking
- Overlap detection

### 4. **Bug Detection**
- Automatic bug detection across multiple categories:
  - Rendering artifacts (empty/black screenshots)
  - Missing elements
  - Incorrect positions
  - Animation glitches
  - Overlap errors
  - Performance issues
- Severity classification (critical, high, medium, low)

### 5. **Report Generation**
- Beautiful HTML reports with embedded screenshots
- Test result summaries and pass rates
- Bug reports with severity indicators
- Markdown export option
- Interactive screenshot viewer

## Usage

### Opening the Testing Panel
- **Keyboard**: Press `Ctrl+Shift+T` (or `Cmd+Shift+T` on Mac)
- **UI**: Click the bug icon in the header toolbar

### Running Tests
1. Select a test category or specific scenario
2. Click "Run Tests" button
3. Watch as tests execute automatically
4. Review results and detected bugs
5. Generate and download HTML report

### Manual Screenshot Capture
Click the camera icon to capture and download a screenshot of the current canvas state.

## Test Scenarios

### Movement Tests
- **Basic Token Movement**: Tests token placement and movement animation
- Verifies position updates and animation completion

### Spell Tests
- **Fireball**: Tests projectile-burst spell with travel and explosion phases
- **Web**: Tests persistent area spell across multiple rounds
- **Lightning Bolt**: Tests ray spell with target tracking

### Selection Tests
- **Token Selection**: Tests single and multi-selection with visual feedback
- Verifies selection highlighting and count

### Combat Tests
- **Persistent Area**: Tests area spells persisting for correct round duration
- Verifies automatic removal after duration expires

## Architecture

### Core Components

#### CanvasCapture (`CanvasCapture.ts`)
- Interfaces with Konva stage for screenshot capture
- Manages state snapshots
- Exports screenshots as data URLs or blobs

#### TestRunner (`TestRunner.ts`)
- Executes test scenarios step by step
- Manages test state and results
- Coordinates with stores for actions

#### VisualAssertions (`VisualAssertions.ts`)
- Provides visual verification methods
- Checks element properties and states
- Supports tolerance for position checks

#### BugDetector (`BugDetector.ts`)
- Analyzes test results for bugs
- Classifies bugs by type and severity
- Tracks bug reports across tests

#### ReportGenerator (`ReportGenerator.ts`)
- Creates HTML and Markdown reports
- Embeds screenshots with interactive viewer
- Provides test summaries and statistics

#### TestingPanel (`TestingPanel.tsx`)
- React component for test UI
- Real-time test execution feedback
- Result display and report generation

## Test Step Types

### Actions
- `addToken`: Add a token to the map
- `moveToken`: Move a token to new position
- `selectToken`: Select one or more tokens
- `castSpell`: Cast a spell effect
- `startCombat`: Begin combat mode
- `nextRound`: Advance combat round
- `selectTool`: Change active tool

### Assertions
- `tokenPosition`: Verify token location
- `tokenExists`: Check token presence
- `spellActive`: Verify spell is active
- `roundNumber`: Check current round
- `selectionCount`: Verify selection count
- `toolActive`: Check active tool

### Other Steps
- `wait`: Pause for specified duration
- `capture`: Take a screenshot with metadata

## Creating Custom Test Scenarios

Add new scenarios to `TestScenarios.ts`:

```typescript
{
  id: 'unique-test-id',
  name: 'Test Name',
  description: 'What this test validates',
  category: 'movement', // or 'spells', 'selection', 'combat', 'visual'
  steps: [
    {
      type: 'action',
      action: {
        type: 'addToken',
        params: { /* action parameters */ }
      },
      description: 'Step description'
    },
    {
      type: 'assert',
      assert: {
        type: 'tokenPosition',
        params: { /* assertion parameters */ },
        expected: { /* expected values */ }
      },
      description: 'Verification step'
    }
  ]
}
```

## Performance Considerations

- Tests run asynchronously to avoid blocking UI
- Screenshots are captured at optimal moments
- Animations are given time to complete
- Memory is managed through proper cleanup

## Debugging Tips

1. **Failed Assertions**: Check the error message for expected vs actual values
2. **Visual Bugs**: Review screenshots in the HTML report
3. **Animation Issues**: Increase wait times between actions
4. **Missing Elements**: Verify element IDs match test expectations

## Future Enhancements

- [ ] Pixel-by-pixel image comparison
- [ ] Network request mocking
- [ ] Performance profiling
- [ ] Test recording and playback
- [ ] CI/CD integration
- [ ] Baseline image management
- [ ] Cross-browser testing

## Best Practices

1. **Keep tests focused**: Each test should verify one specific behavior
2. **Use meaningful names**: Test and step descriptions should be clear
3. **Add appropriate waits**: Allow animations to complete before assertions
4. **Capture key moments**: Take screenshots at important visual states
5. **Clean up after tests**: Ensure tests don't affect subsequent runs
6. **Review reports**: Check both passed and failed tests for insights

## Troubleshooting

### Tests not running
- Ensure the canvas stage is initialized
- Check browser console for errors
- Verify test scenarios are properly formatted

### Screenshots appear black
- Canvas may not be rendered yet
- Add wait time before capture
- Check if stage reference is valid

### Assertions failing incorrectly
- Adjust position tolerance in VisualAssertions
- Verify expected values match actual implementation
- Check for timing issues with animations

### Performance issues
- Reduce screenshot resolution if needed
- Limit number of captures per test
- Run tests in smaller batches