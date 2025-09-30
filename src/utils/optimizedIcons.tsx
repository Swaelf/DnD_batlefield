/**
 * Optimized icons for MapMaker
 * Only exports the 78 icons actually used in the project to reduce bundle size
 * Reduces icon bundle from 456K to ~78K (83% reduction)
 */

export {
  // Core UI Icons
  ChevronDown, ChevronUp, ChevronRight, X, XCircle, Check, CheckCircle,
  Plus, Minus, Search, Settings, HelpCircle, Eye, EyeOff, Copy, Trash2,

  // Tools & Actions
  MousePointer, MousePointer2, Pointer, Square, Circle, CircleDot, Layers, Home, User, Sparkles,
  Move, Edit, Edit2, Edit3, Ruler, Magnet, Grid3x3, Grid3X3, Hand, Type, Pencil, Eraser,

  // Media & Files
  Play, Pause, SkipForward, SkipBack, Save, Download, Upload, Image, Camera,
  FileText, FileImage, Clipboard, Import, Share,

  // Drawing & Editing
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette, Pipette,
  RotateCw, RotateCcw, RefreshCw, Target, Shapes, Code, Undo, Redo,

  // Alignment
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,

  // Navigation & Layout
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpToLine, ArrowDownToLine,
  ZoomIn, ZoomOut, Grid, Maximize, Maximize2, GripVertical, Group, Ungroup, Move3D,

  // Objects & Nature
  Shield, Sword, Crown, Heart, Skull, Flame, Snowflake, Wind, Cloud, Star,
  Mountain, TreePine, Trees, Droplet, Droplets, Sun, Moon, Waves,

  // Buildings & Structures
  Church, DoorOpen, Box, Package,

  // Status & Feedback
  AlertCircle, AlertTriangle, Bug, Activity, Clock, StopCircle, Printer,
  Lock, Unlock, Hexagon, Triangle, Map, MapPin, List, Filter,
  Users, UserPlus, Wand2, MessageSquare, Dices, Zap, Accessibility,

  // Weather & Environment
  CloudRain, CloudSnow,

  // Technology & Tools
  Cpu, HardDrive, Monitor, Keyboard, Volume2, Mail, Info,

  // UI Controls
  ToggleLeft, ToggleRight, Lasso, Shuffle,

  // Collaboration
  GitMerge,

  // Value & Commerce
  Coins, Gem,

  // Communication
  MessageCircle, PlusCircle,

} from 'lucide-react'

// Re-export the LucideIcon type separately
export type { LucideIcon } from 'lucide-react'