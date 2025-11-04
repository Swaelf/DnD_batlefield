#!/bin/bash

# Script to analyze imports for all multi-component files

echo "=== Import Analysis for Multi-Component Files ==="
echo ""

# Array of files to analyze
files=(
  "src/components/Timeline/CombatTracker.styled.tsx"
  "src/components/ui/Popover.tsx"
  "src/components/ui/Panel.tsx"
  "src/components/ui/Modal.tsx"
  "src/components/ui/Input.tsx"
  "src/components/ui/Loading.tsx"
  "src/components/primitives/TextVE.tsx"
  "src/components/Token/TokenLibrary.tsx"
  "src/components/ui/Select.tsx"
  "src/components/ui/Menu.tsx"
  "src/components/primitives/ButtonVE.tsx"
  "src/components/ui/Tooltip.tsx"
  "src/components/ui/Badge.tsx"
  "src/components/primitives/BoxVE.tsx"
  "src/components/ui/FieldLabel.tsx"
  "src/components/ContextMenu/ContextMenu.tsx"
  "src/components/Canvas/GridControls.tsx"
  "src/components/ErrorBoundary/ErrorBoundary.tsx"
  "src/components/ui/Grid.tsx"
  "src/components/ui/Checkbox.tsx"
  "src/components/ui/Avatar.tsx"
  "src/components/Selection/AdvancedSelectionTool.tsx"
  "src/components/Export/EnhancedExportSystem.tsx"
  "src/components/Canvas/CanvasControls.tsx"
  "src/components/ui/VirtualScrollList.tsx"
  "src/components/ui/EffectPropertiesPanel.tsx"
)

for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  File not found: $file"
    continue
  fi

  # Get filename without path
  filename=$(basename "$file")
  # Get search pattern (without .tsx extension)
  search_pattern="${filename%.tsx}"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📄 File: $file"
  echo "🔍 Search pattern: $search_pattern"
  echo ""

  # Count imports
  import_count=$(grep -r "from ['\"].*${search_pattern}" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
  echo "📊 Total imports: $import_count"
  echo ""

  if [ "$import_count" -gt 0 ]; then
    echo "📍 Import locations:"
    grep -rn "from ['\"].*${search_pattern}" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -30
  fi
  echo ""
done

echo "=== Analysis Complete ==="
