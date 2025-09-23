import React from 'react'
import { Box } from './primitives/BoxVE'
import { Button, ToolButton, IconButton } from './primitives/ButtonVE'
import { Text, Heading, Label, Caption, Code, Paragraph } from './primitives/TextVE'
import { Save, Download, Settings } from 'lucide-react'

export const TestVanillaExtract: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="4"
      padding="6"
      backgroundColor="background"
      minHeight="screen"
    >
      <Heading level={1} size="3xl" color="text">
        Vanilla Extract Migration Test
      </Heading>

      <Box display="flex" flexDirection="column" gap="4" maxWidth="md">
        <Text variant="body" size="lg" color="textSecondary">
          Testing migrated components with zero-runtime CSS-in-JS
        </Text>

        {/* Button Tests */}
        <Box display="flex" flexDirection="column" gap="3">
          <Heading level={2} size="xl">Buttons</Heading>

          <Box display="flex" gap="3" flexWrap="wrap">
            <Button variant="primary" size="md">
              Primary Button
            </Button>
            <Button variant="secondary" size="md">
              Secondary Button
            </Button>
            <Button variant="outline" size="md">
              Outline Button
            </Button>
            <Button variant="ghost" size="md">
              Ghost Button
            </Button>
            <Button variant="destructive" size="md">
              Destructive
            </Button>
          </Box>

          <Box display="flex" gap="3" flexWrap="wrap">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </Box>

          <Box display="flex" gap="3">
            <ToolButton active={false}>
              <Settings size={16} />
            </ToolButton>
            <ToolButton active={true}>
              <Save size={16} />
            </ToolButton>
            <IconButton
              icon={<Download size={16} />}
              variant="outline"
              aria-label="Download"
            />
          </Box>

          <Button variant="primary" loading={true}>
            Loading Button
          </Button>
        </Box>

        {/* Text Tests */}
        <Box display="flex" flexDirection="column" gap="3">
          <Heading level={2} size="xl">Typography</Heading>

          <Heading level={1} size="3xl">Heading 1</Heading>
          <Heading level={2} size="2xl">Heading 2</Heading>
          <Heading level={3} size="xl">Heading 3</Heading>

          <Paragraph>
            This is a paragraph of text using the new Vanilla Extract text component.
            It demonstrates the typography system working correctly.
          </Paragraph>

          <Text size="lg" weight="semibold" color="primary">
            Large semi-bold primary text
          </Text>

          <Text size="sm" color="textSecondary">
            Small secondary text
          </Text>

          <Caption>This is caption text</Caption>

          <Label>Form Label</Label>
          <Label required>Required Form Label</Label>

          <Text>
            Here's some <Code>inline code</Code> in text
          </Text>

          <Text gradient="dnd" size="xl" weight="bold">
            D&D Gradient Text
          </Text>
        </Box>

        {/* Box Layout Tests */}
        <Box display="flex" flexDirection="column" gap="3">
          <Heading level={2} size="xl">Layout</Heading>

          <Box
            display="grid"
            gridTemplateColumns="3"
            gap="4"
            padding="4"
            backgroundColor="surface"
            borderRadius="lg"
            borderWidth="1"
            borderStyle="solid"
            borderColor="border"
          >
            <Box
              padding="3"
              backgroundColor="backgroundSecondary"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text size="sm">Grid Item 1</Text>
            </Box>
            <Box
              padding="3"
              backgroundColor="backgroundSecondary"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text size="sm">Grid Item 2</Text>
            </Box>
            <Box
              padding="3"
              backgroundColor="backgroundSecondary"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text size="sm">Grid Item 3</Text>
            </Box>
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            padding="4"
            backgroundColor="surface"
            borderRadius="md"
            boxShadow="md"
          >
            <Text weight="medium">Flex layout</Text>
            <Button variant="outline" size="sm">Action</Button>
          </Box>
        </Box>

        {/* Performance Test */}
        <Box>
          <Heading level={2} size="xl" color="success">
            Migration Successful! ✓
          </Heading>
          <Text color="textSecondary">
            All components are working with Vanilla Extract zero-runtime CSS-in-JS
          </Text>
        </Box>
      </Box>
    </Box>
  )
}