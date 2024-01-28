/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/no-array-index-key */
/* eslint-disable prefer-destructuring */
import React, { useEffect, useState } from 'react';
import { XyzTransitionGroup } from '@animxyz/react';
// @ts-ignore
import WIIBalanceBoard, { WeightsType } from './wii-code/src/wiibalanceboard';

import '@/index.css';
import BoardDisplay from './board';
import Canvas from './canvas';

const App = () => {
  const [count, setCount] = useState(0);
  const [showCount, setShowCount] = useState(true);
  const [boards, setBoards] = useState<WIIBalanceBoard[]>([]);

  const increment = () => {
    setShowCount(false);
    setTimeout(() => {
      requestAnimationFrame(() => {
        setShowCount(true);
        setCount(count + 1);
      });
    }, 150);
  };

  const removeBoard = (board: WIIBalanceBoard) => {
    setBoards(boards.filter((b) => b !== board));
  };

  const connectToBoard = async () => {
    let device;
    try {
      const devices = await navigator.hid.requestDevice({
        filters: [{ vendorId: 0x057e }],
      });
      // @ts-ignore
      device = devices[0];

      if (!device) {
        return console.log('No device was selected.');
      }
      const board = new WIIBalanceBoard(device);

      setBoards([...boards, board]);
    } catch (error) {
      console.log('An error oc[c]urred.', error);
    }

    if (!device) {
      console.log('No device was selected.');
    } else {
      console.log(`HID: ${device.productName}`);
    }
    return undefined;
  };

  useEffect(() => {
    console.log(boards);
    // @ts-ignore
    window.boards = boards;

    const customEvent = new CustomEvent('boards', { detail: boards });

    window.dispatchEvent(customEvent);
  }, [boards]);

  return (
    <div className="min-h-screen w-full">
      <Canvas />
      <div className="flex justify-center align-middle h-screen">
        <div className="bg-white m-auto p-10 rounded-xl w-3/4 md:w-1/2 text-center">
          <div className="underline text-5xl">Hello World</div>
          <div className="flex justify-center m-5">
            <button className="text-2xl m-auto w-full bg-slate-200 hover:bg-slate-300 p-5 rounded-2xl flex" onClick={() => connectToBoard()}>
              <div className="flex-initial">
                Click Count:
              </div>
              <XyzTransitionGroup xyz="fade down-100% back-2" duration={150} className="flex-1">
                {showCount && (
                <div>
                  {count}
                </div>
                )}
              </XyzTransitionGroup>
            </button>
          </div>
          <div className="m-5 text-left">
            {
              boards.map((board, key) => (
                <div key={key}>
                  <BoardDisplay board={board} removeSelf={() => removeBoard(board)} />
                </div>
              ))
          }
          </div>
        </div>
      </div>
    </div>

  );
};

export default App;
