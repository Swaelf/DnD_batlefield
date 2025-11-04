#!/bin/bash

find src/components -name "*.tsx" -type f | grep -v "\.css\.ts" | while read file; do
  count=$(grep -c "^export " "$file" 2>/dev/null)
  if [ "$count" -gt 1 ]; then
    echo "$count $file"
  fi
done | sort -rn
