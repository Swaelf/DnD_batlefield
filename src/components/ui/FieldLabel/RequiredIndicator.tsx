import { Text } from '@/components/primitives/TextVE'

export type RequiredIndicatorProps = {
  visible?: boolean
}

export const RequiredIndicator = ({ visible = true }: RequiredIndicatorProps) => {
  if (!visible) return null

  return (
    <Text as="span" color="error" weight="bold">
      {' *'}
    </Text>
  )
}

RequiredIndicator.displayName = 'RequiredIndicator'
