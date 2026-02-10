import Button from './Button';

export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    filled: {
      control: 'boolean',
      description: 'Use filled variant (default: false, uses stroked)',
    },
    ghost: {
      control: 'boolean',
      description: 'Use ghost variant - text only with padding',
    },
    size: {
      control: { type: 'select' },
      options: ['', 'lg'],
      description: 'Button size: empty for normal, "lg" for large',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Fill container width',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    iconPosition: {
      control: { type: 'radio' },
      options: ['left', 'right'],
      description: 'Position of the icon',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Icon-only button (no text)',
    },
    align: {
      control: { type: 'radio' },
      options: ['center', 'left'],
      description: 'Content alignment',
    },
    type: {
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
      description: 'Button type (only for button element)',
    },
    children: {
      control: 'text',
      description: 'Button content/text',
    },
    onClick: { action: 'clicked' },
  },
};

// Default stroked button
export const Stroked = {
  args: {
    children: 'Stroked Button',
    filled: false,
    ghost: false,
  },
};

// Filled button
export const Filled = {
  args: {
    children: 'Filled Button',
    filled: true,
  },
};

// Ghost button
export const Ghost = {
  args: {
    children: 'Ghost Button',
    ghost: true,
  },
};

// Large size
export const Large = {
  args: {
    children: 'Large Button',
    filled: true,
    size: 'lg',
  },
};

// Full width
export const FullWidth = {
  args: {
    children: 'Full Width Button',
    filled: true,
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

// Disabled state
export const Disabled = {
  args: {
    children: 'Disabled Button',
    filled: true,
    disabled: true,
  },
};

// With icon (left)
export const WithIconLeft = {
  args: {
    children: 'Button with Icon',
    filled: true,
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8 0L10.5 5.5L16 6.5L12 10.5L13 16L8 13L3 16L4 10.5L0 6.5L5.5 5.5L8 0Z" />
      </svg>
    ),
    iconPosition: 'left',
  },
};

// With icon (right)
export const WithIconRight = {
  args: {
    children: 'Button with Icon',
    filled: true,
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z" />
      </svg>
    ),
    iconPosition: 'right',
  },
};

// Icon only
export const IconOnly = {
  args: {
    filled: true,
    iconOnly: true,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 0L12.5 7L20 10L12.5 13L10 20L7.5 13L0 10L7.5 7L10 0Z" />
      </svg>
    ),
  },
};

// Left aligned
export const LeftAligned = {
  args: {
    children: 'Left Aligned Button',
    filled: true,
    align: 'left',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

// As link
export const AsLink = {
  args: {
    children: 'Button as Link',
    filled: true,
    href: 'https://example.com',
  },
  render: (args) => <Button {...args} />,
};

// All variants comparison
export const AllVariants = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Button>Stroked Button</Button>
      <Button filled>Filled Button</Button>
      <Button ghost>Ghost Button</Button>
      <Button filled disabled>
        Disabled Button
      </Button>
      <Button filled size="lg">
        Large Button
      </Button>
    </div>
  ),
};
