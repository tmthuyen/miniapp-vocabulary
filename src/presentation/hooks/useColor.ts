import React from 'react';

function useColor() {
  const [color, setColor] = React.useState<string>('blue');

  React.useEffect(() => {
    const initialColor = document.documentElement.dataset.theme || 'blue';
    setColor(initialColor);
  }, []);

  const changeColor = (newColor: 'rose' | 'emerald' | 'blue' | 'violet' | 'orange') => {
    document.documentElement.dataset.theme = newColor;
    setColor(newColor);
  };

  return { color, changeColor };
}
export default useColor;
