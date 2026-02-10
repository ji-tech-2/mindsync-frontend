import React from 'react';
import Card from './Card';

export default {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    padded: {
      control: 'boolean',
      description: 'Whether the card has internal padding',
    },
    children: {
      control: 'text',
      description: 'Content inside the card',
    },
  },
};

export const Default = {
  args: {
    padded: true,
    children: (
      <div>
        <h3
          style={{
            margin: 0,
            marginBottom: '1rem',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Card Title
        </h3>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)' }}>
          This is a card with very large rounding and surface background color.
          It can be used to group related information or as a container for
          other components.
        </p>
      </div>
    ),
  },
};

export const WithoutPadding = {
  args: {
    padded: false,
    children: (
      <img
        src="https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=800"
        alt="Sample"
        style={{ width: '100%', display: 'block' }}
      />
    ),
  },
};

export const CustomContent = {
  args: {
    padded: true,
    children: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          Important Metric
        </p>
        <p
          style={{
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            margin: '0.5rem 0',
          }}
        >
          85%
        </p>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Increased from last month
        </p>
      </div>
    ),
  },
};
