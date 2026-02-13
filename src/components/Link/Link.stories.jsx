import Link from './Link';

export default {
  title: 'Components/TextLink',
  component: Link,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Link text/content',
    },
    href: {
      control: 'text',
      description: 'URL to navigate to',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    target: {
      control: 'text',
      description: 'Link target (e.g., "_blank")',
    },
    title: {
      control: 'text',
      description: 'Link title/tooltip',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
    },
  },
};

export const Default = {
  args: {
    children: 'Click me',
    href: '#',
  },
};

export const WithUrl = {
  args: {
    children: 'Go to Dashboard',
    href: '/dashboard',
  },
};

export const OpenInNewTab = {
  args: {
    children: 'Visit External Site',
    href: 'https://example.com',
    target: '_blank',
  },
};

export const Disabled = {
  args: {
    children: 'Disabled Link',
    href: '#',
    disabled: true,
  },
};

export const WithTooltip = {
  args: {
    children: 'Hover over me',
    href: '#',
    title: 'This is a helpful tooltip',
  },
};

export const InParagraph = {
  render: () => (
    <p style={{ fontSize: '16px' }}>
      This is a paragraph with a <Link href="#">link inside</Link> that inherits
      the parent font size.
    </p>
  ),
};

export const InSmallText = {
  render: () => (
    <p style={{ fontSize: '12px' }}>
      Small text with <Link href="#">link</Link> showing size inheritance.
    </p>
  ),
};

export const InLargeText = {
  render: () => (
    <p style={{ fontSize: '24px' }}>
      Large text with <Link href="#">link</Link> showing size inheritance.
    </p>
  ),
};

export const MultipleLinksSentence = {
  render: () => (
    <p>
      You can <Link href="/login">login</Link>,{' '}
      <Link href="/register">sign up</Link>, or{' '}
      <Link href="/reset">reset your password</Link>.
    </p>
  ),
};

export const WithCustomClassName = {
  args: {
    children: 'Custom Styled Link',
    href: '#',
    className: 'custom-class',
  },
};
