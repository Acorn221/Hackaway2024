/* eslint-disable no-param-reassign */
import {
  FC, useCallback, useEffect, useState,
} from 'react';
import { FaLongArrowAltUp } from 'react-icons/fa';
import WIIBalanceBoard, { WeightsType } from './wii-code/src/wiibalanceboard';

type BoardDisplayProps = {
	board: WIIBalanceBoard;
  removeSelf: () => void;
};

const BoardDisplay: FC<BoardDisplayProps> = ({ board, removeSelf }) => {
  const [arrowRotation, setArrowRotation] = useState(0);
  const [showArrow, setShowArrow] = useState(false);
  const [userWeight, setUserWeight] = useState(0);
  const [weight, setWeight] = useState<WeightsType>({
    TOP_LEFT: 0,
    BOTTOM_LEFT: 0,
    TOP_RIGHT: 0,
    BOTTOM_RIGHT: 0,
  });

  const setRotation = (str: string) => {
    if (str === 'FORWARD MOVE') {
      setArrowRotation(0);
    } else if (str === 'BACKWARD MOVE') {
      setArrowRotation(180);
    } else if (str === 'LEFT MOVE') {
      setArrowRotation(270);
    } else if (str === 'RIGHT MOVE') {
      setArrowRotation(90);
    } else {
      setShowArrow(false);
      return;
    }
    setShowArrow(true);
    console.log('Got Rotation', str, 'showing');
  };

  useEffect(() => {
    board.WeightListener = (w) => {
      setWeight({ ...w });
      // const total = w.TOP_LEFT + w.TOP_RIGHT + w.BOTTOM_LEFT + w.BOTTOM_RIGHT;
    };

    board.target.addEventListener('move', (e) => {
      // @ts-ignore
      setRotation(e.detail);
    });

    board.target.addEventListener('userWeight', (e) => {
      // @ts-ignore
      setUserWeight(e.detail);
    }); 

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
      <div>
        User Weight:
        {userWeight}
      </div>

      <div className="grid grid-cols-2 grid-rows-2 w-40 h-20">
        <div className="h-10 w-20" style={{ backgroundColor: 'green', opacity: weight.TOP_LEFT / 100 }} />
        <div className="h-10 w-20" style={{ backgroundColor: 'green', opacity: weight.TOP_RIGHT / 100 }} />
        <div className="h-10 w-20" style={{ backgroundColor: 'green', opacity: weight.BOTTOM_LEFT / 100 }} />
        <div className="h-10 w-20" style={{ backgroundColor: 'green', opacity: weight.BOTTOM_RIGHT / 100 }} />
      </div>

      <div style={{ fontSize: '10rem', transform: `rotate(${arrowRotation}deg)`, visibility: showArrow ? 'initial' : 'hidden' }} 
        className="h-20 w-20"
        >
        <FaLongArrowAltUp className="text-2xl w-20 h-20" />
      </div>
      <button type="button" onClick={() => removeSelf()}>Remove</button>
    </>
  );
};

export default BoardDisplay;
