// Primitive component exports - Vanilla Extract versions
export { Box, type BoxProps } from './BoxVE'
export {
  Text,
  Heading,
  Label,
  Caption,
  Code,
  Paragraph,
  type TextProps,
  type HeadingProps,
  type LabelProps,
  type CaptionProps,
  type CodeProps,
  type ParagraphProps
} from './TextVE'
export {
  Button,
  ToolButton,
  IconButton,
  type ButtonProps,
  type ToolButtonProps,
  type IconButtonProps
} from './ButtonVE'

// Legacy exports for backward compatibility (can be removed later)
export { Button as LoadingButton, type ButtonProps as LoadingButtonProps } from './ButtonVE'