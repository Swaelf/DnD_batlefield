import { memo, type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'

type TokenQuickActionsProps = {
  currentHP: number
  maxHP: number
  onUpdate: (updates: { currentHP: number }) => void
}

const TokenQuickActionsComponent: FC<TokenQuickActionsProps> = ({
  currentHP,
  maxHP,
  onUpdate
}) => {
  const handleDamage5 = () => {
    onUpdate({ currentHP: Math.max(0, currentHP - 5) })
  }

  const handleHeal5 = () => {
    onUpdate({ currentHP: currentHP + 5 })
  }

  const handleFullHeal = () => {
    onUpdate({ currentHP: maxHP })
  }

  const handleKnockOut = () => {
    onUpdate({ currentHP: 0 })
  }

  return (
    <Box>
      <Box marginBottom={1}>
        <Text size="xs" color="gray400">Quick Actions</Text>
      </Box>
      <Box display="flex" gap={1}>
        <Button
          onClick={handleDamage5}
          size="sm"
          variant="outline"
          title="Damage 5"
          style={{ flex: 1, fontSize: '11px', padding: '4px' }}
        >
          -5
        </Button>
        <Button
          onClick={handleHeal5}
          size="sm"
          variant="outline"
          title="Heal 5"
          style={{ flex: 1, fontSize: '11px', padding: '4px' }}
        >
          +5
        </Button>
        <Button
          onClick={handleFullHeal}
          size="sm"
          variant="outline"
          title="Heal to full"
          style={{ flex: 1, fontSize: '11px', padding: '4px' }}
        >
          Full
        </Button>
        <Button
          onClick={handleKnockOut}
          size="sm"
          variant="outline"
          title="Knock out"
          style={{ flex: 1, fontSize: '11px', padding: '4px' }}
        >
          KO
        </Button>
      </Box>
    </Box>
  )
}

export const TokenQuickActions = memo(TokenQuickActionsComponent)
TokenQuickActions.displayName = 'TokenQuickActions'
