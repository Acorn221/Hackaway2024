/* eslint-disable no-param-reassign */
import {
  FC, useCallback, useEffect, useState,
} from 'react';
import WIIBalanceBoard, { WeightsType } from './wii-code/src/wiibalanceboard';

type BoardDisplayProps = {
	board: WIIBalanceBoard;
  removeSelf: () => void;
};

const BoardDisplay: FC<BoardDisplayProps> = ({ board, removeSelf }) => {
  const [weight, setWeight] = useState<WeightsType>({
    TOP_LEFT: 0,
    BOTTOM_LEFT: 0,
    TOP_RIGHT: 0,
    BOTTOM_RIGHT: 0,
  });

  useEffect(() => {
    board.WeightListener = (w) => {
      setWeight({ ...w });
      // const total = w.TOP_LEFT + w.TOP_RIGHT + w.BOTTOM_LEFT + w.BOTTOM_RIGHT;
    };

    // board.target.addEventListener('weight', (e) => handleUpdate);
    // return () => {
    //   board.target.removeEventListener('weight', (e) => handleUpdate);
    // };
  }, [board]);

  return (
    <>
      <div>
        Bottom Right:
        {weight.BOTTOM_RIGHT}
      </div>
      <div>
        Top Left:
        {weight.TOP_LEFT}
      </div>
      <div>
        Top Right:
        {weight.TOP_RIGHT}
      </div>
      <div>
        Bottom Left:
        {weight.BOTTOM_LEFT}
      </div>
      <div>
        Total:
        {Math.round(weight.BOTTOM_RIGHT + weight.TOP_LEFT + weight.TOP_RIGHT + weight.BOTTOM_LEFT)}
      </div>
      <button type="button" onClick={() => removeSelf()}>Remove</button>
    </>
  );
};

export default BoardDisplay;