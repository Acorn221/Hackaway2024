import { useEffect } from 'react';
import { onLoad } from './gameLogic';

const Canvas = () => {
  useEffect(() => {
    onLoad();
  }, []);

  return (
    <canvas id="canvas" />
  );
};

export default Canvas;
