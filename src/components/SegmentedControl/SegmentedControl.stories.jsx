import React, { useState } from 'react';
import SegmentedControl from './SegmentedControl';

export default {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

const Template = (args) => {
  const [value, setValue] = useState(args.value || 'daily');
  return (
    <SegmentedControl
      {...args}
      value={value}
      onChange={(v) => {
        setValue(v);
        args.onChange?.(v);
      }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  options: [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
  ],
};

export const ThreeOptions = Template.bind({});
ThreeOptions.args = {
  options: [
    { label: 'Day', value: 'day' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ],
};

export const FullWidth = Template.bind({});
FullWidth.args = {
  fullWidth: true,
  options: [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
  ],
};

export const Small = Template.bind({});
Small.args = {
  size: 'sm',
  options: [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
  ],
};
