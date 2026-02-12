import Dropdown from './Dropdown';
import { useState } from 'react';

export default {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

const Template = (args) => {
  const [selected, setSelected] = useState(args.value);
  return (
    <Dropdown
      {...args}
      value={selected}
      onChange={(val) => {
        setSelected(val);
        args.onChange?.(val);
      }}
    />
  );
};

const TemplateWithContainer = (args) => {
  const [selected, setSelected] = useState(args.value);
  return (
    <div style={{ width: args.fullWidth ? '400px' : '100%' }}>
      <Dropdown
        {...args}
        value={selected}
        onChange={(val) => {
          setSelected(val);
          args.onChange?.(val);
        }}
      />
    </div>
  );
};

export const Default = {
  render: TemplateWithContainer,
  args: {
    label: 'Mental Health Index',
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4', value: '4' },
    ],
  },
};

export const SelectedValue = {
  render: TemplateWithContainer,
  args: {
    label: 'Mental Health Index',
    value: { label: 'Option 1', value: '1' },
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
    ],
  },
};

export const FullWidth = {
  render: TemplateWithContainer,
  args: {
    label: 'Mental Health Index',
    fullWidth: true,
    options: [
      { label: 'Text 1', value: '1' },
      { label: 'Text 2', value: '2' },
      { label: 'Text 3', value: '3' },
    ],
  },
};

export const Disabled = {
  render: TemplateWithContainer,
  args: {
    label: 'Disabled Dropdown',
    disabled: true,
    options: [],
  },
};

export const WithoutFloatingLabel = {
  render: TemplateWithContainer,
  args: {
    label: 'Mental Health Index',
    floatingLabel: false,
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
    ],
  },
};
