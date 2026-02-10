import '../src/index.css';

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    backgrounds: {
      options: {
        light: { name: 'Light', value: '#fffbea' },
        dark: { name: 'Dark', value: '#5c5643' },
        surface: { name: 'Surface', value: '#f2edd5' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'light' },
  },
};

export default preview;
