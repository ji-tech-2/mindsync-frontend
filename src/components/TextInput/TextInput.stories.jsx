import TextInput from './TextInput';
import { useState } from 'react';

export default {
  title: 'Components/TextInput',
  component: TextInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text (acts as placeholder)',
    },
    value: {
      control: 'text',
      description: 'Input value',
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'password', 'email', 'number', 'tel'],
      description: 'Input type',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Fill container width',
    },
    onChange: { action: 'changed' },
  },
};

const Template = (args) => {
  const [value, setValue] = useState(args.value || '');

  const handleChange = (e) => {
    setValue(e.target.value);
    if (args.onChange) args.onChange(e);
  };

  return <TextInput {...args} value={value} onChange={handleChange} />;
};

export const Default = {
  render: Template,
  args: {
    label: 'Email Address',
    type: 'email',
  },
};

export const WithValue = {
  render: Template,
  args: {
    label: 'Username',
    value: 'johndoe',
  },
};

export const Password = {
  render: Template,
  args: {
    label: 'Password',
    type: 'password',
  },
};

export const Error = {
  render: Template,
  args: {
    label: 'Email Address',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const Disabled = {
  render: Template,
  args: {
    label: 'Disabled Input',
    disabled: true,
  },
};

export const FullWidth = {
  render: Template,
  args: {
    label: 'Full Width Input',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};
