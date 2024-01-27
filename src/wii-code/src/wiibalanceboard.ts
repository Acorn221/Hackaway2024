/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-shadow */
/* eslint-disable no-case-declarations */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
import _ from 'lodash';
import {
  ReportMode,
  DataReportMode,
  LEDS,
  BUTTON_BYTE1,
  BUTTON_BYTE2,
  InputReport,
  WiiBalanceBoardPositions,
} from './const.js';

import WIIMote from './wiimote.js';

export enum Actions {
  FORWARD,
  BACKWARD,
  LEFT,
  RIGHT,
  JUMP,
  CROUCH,
  RUN,
  HOP,
}

export type WeightsType = {
  TOP_RIGHT: number;
  BOTTOM_RIGHT: number;
  TOP_LEFT: number;
  BOTTOM_LEFT: number;
};

export default class WIIBalanceBoard extends WIIMote {
  WeightListener: any;

  target: EventTarget = new EventTarget();

  weights: WeightsType;

  weightsHistory: WeightsType[];

  calibration: number[][];

  currentMove: Actions | string | null = null;

  timeMoveStarted: number | null = null;

  userWeight: number | null = null;

  sampleTicker = 0;

  userWeightHistory: number[] = [];

  constructor(device: HIDDevice) {
    super(device);

    this.WeightListener = null;
    this.weights = {
      TOP_RIGHT: 0,
      BOTTOM_RIGHT: 1,
      TOP_LEFT: 2,
      BOTTOM_LEFT: 3,
    };

    this.weightsHistory = [];

    this.calibration = [
      [10000.0, 10000.0, 10000.0, 10000.0],
      [10000.0, 10000.0, 10000.0, 10000.0],
      [10000.0, 10000.0, 10000.0, 10000.0],
    ];

    // @ts-ignore
    this.target.addEventListener('weight', (e: CustomEvent<WeightsType>) => {
      this.weightsHistory.push(e.detail);
      if (this.weightsHistory.length > 1000) {
        this.weightsHistory.shift();
      }
      this.analyseMove();
      const weight = this.getUserStableWeightMode();
      if (weight && weight > 25) {
        this.userWeight = this.getUserWeight();
        console.log(this.userWeight);
        this.userWeightHistory.push(weight);
        if (this.userWeightHistory.length > 100) {
          this.userWeightHistory.shift();
        }
      }
    });
  }

  // Initiliase the Wiimote
  initiateDevice() {
    this.device.open().then(() => {
      this.sendReport(ReportMode.STATUS_INFO_REQ, [0x00]);
      this.sendReport(ReportMode.MEM_REG_READ, [
        0x04,
        0xa4,
        0x00,
        0x24,
        0x00,
        0x18,
      ]);
      this.setDataTracking(DataReportMode.EXTENSION_8BYTES);

      this.device.oninputreport = (e) => this.listener(e);
    });
  }

  WeightCalibrationDecoder(data: any) {
    const length = data.getUint8(2) / 16 + 1;
    if (length === 16) {
      [0, 1].forEach((i) => {
        this.calibration[i] = [0, 1, 2, 3].map((j) => data.getUint16(4 + i * 8 + 2 * j, true));
      });
    } else if (length === 8) {
      this.calibration[2] = [0, 1, 2, 3].map((j) => data.getUint16(4 + 2 * j, true));
    }
  }

  WeightDecoder(data: any) {
    const weights = [0, 1, 2, 3].map((i) => {
      const raw = data.getUint16(2 + 2 * i, false);
      // return raw;
      if (raw < this.calibration[0][i]) {
        return 0;
      } if (raw < this.calibration[1][i]) {
        return (
          17
          * ((raw - this.calibration[0][i])
            / (this.calibration[1][i] - this.calibration[0][i]))
        );
      }
      return (
        17
          + 17
            * ((raw - this.calibration[1][i])
              / (this.calibration[2][i] - this.calibration[1][i]))
      );
    });

    for (const position in WiiBalanceBoardPositions) {
      // @ts-ignore
      const index = WiiBalanceBoardPositions[position];
      // @ts-ignore
      this.weights[position] = weights[index];
    }

    if (this.WeightListener) {
      this.WeightListener(this.weights);
    }
  }

  // main listener received input from the Wiimote
  listener(event: any) {
    const { data } = event;

    switch (event.reportId) {
      case InputReport.STATUS:
        console.log('status');
        break;
      case InputReport.READ_MEM_DATA:
        // calibration data
        console.log('calibration data');
        this.WeightCalibrationDecoder(data);
        break;
      case DataReportMode.EXTENSION_8BYTES:
        // weight data

        // button data
        // @ts-ignore
        this.BTNDecoder(...[0, 1].map((i) => data.getUint8(i)));

        // raw weight data
        this.WeightDecoder(data);
        this.target.dispatchEvent(new CustomEvent('weight', { detail: this.weights }));

        // weight listener
        break;
      default:
        console.log(`event of unused report id ${event.reportId}`);
        break;
    }
  }

  analyseMove() {
    if (this.weightsHistory.length < 10 || !this.userWeight) {
      return;
    }

    // calculate the average of the last 10 weights
    const avg = {
      TOP_RIGHT: 0,
      BOTTOM_RIGHT: 0,
      TOP_LEFT: 0,
      BOTTOM_LEFT: 0,
    };

    this.weightsHistory.forEach((weight) => {
      for (const position in WiiBalanceBoardPositions) {
        // @ts-ignore
        avg[position] += weight[position];
      }
    });

    // Your existing code calculating averages and threshold

    // Calculate sum of weights for left, right, top and bottom
    const sum = {
      LEFT: (avg.TOP_LEFT + avg.BOTTOM_LEFT) / 2,
      RIGHT: (avg.TOP_RIGHT + avg.BOTTOM_RIGHT) / 2,
      TOP: (avg.TOP_LEFT + avg.TOP_RIGHT) / 2,
      BOTTOM: (avg.BOTTOM_LEFT + avg.BOTTOM_RIGHT) / 2,
    };

    // Heuristic for determining if a user is leaning to a side
    // Let's use the getUserWeight function to make estimations based on the user's weight
    const directionThreshold = this.userWeight * 0.2;

    let detectedDirection = '';

    // Check which direction the user is leaning
    if (sum.LEFT > directionThreshold) {
      detectedDirection = 'LEFT';
    } else if (sum.RIGHT > directionThreshold) {
      detectedDirection = 'RIGHT';
    } else if (sum.TOP > directionThreshold / 2) {
      detectedDirection = 'FORWARD';
    } else if (sum.BOTTOM > directionThreshold / 2) {
      detectedDirection = 'BACKWARD';
    } else {
      detectedDirection = 'NEUTRAL';
    }

    if (this.currentMove !== detectedDirection) {
      this.timeMoveStarted = Date.now();
      this.currentMove = detectedDirection;
      console.log(this.currentMove);
    }
  }

  getUserStableWeightMode() {
    if (this.sampleTicker < 10) {
      this.sampleTicker++;
      return null;
    }
    this.sampleTicker = 0;

    const weights = this.weightsHistory.map((weight) => {
      const sum = Math.round(weight.TOP_LEFT + weight.TOP_RIGHT + weight.BOTTOM_LEFT + weight.BOTTOM_RIGHT);
      return sum;
    });
    if (!weights.length) return null;
    const modeMap = {};
    let maxCount = 1;
    let modes = [weights[0]];
    for (let i = 0; i < weights.length; i++) {
      const el = weights[i];
      // @ts-ignore
      if (modeMap[el] == null) modeMap[el] = 1;
      // @ts-ignore
      else modeMap[el]++;
      // @ts-ignore  ]
      if (modeMap[el] > maxCount) {
        modes = [el];
        // @ts-ignore
        maxCount = modeMap[el];
        // @ts-ignore
      } else if (modeMap[el] === maxCount) {
        modes.push(el);
        // @ts-ignore
        maxCount = modeMap[el];
      }
    }
    return modes[0];
  }

  getUserWeight() {
    // create a mode of the last 100 user weights
    const modeMap = {};
    let maxCount = 1;
    let modes = [this.userWeightHistory[0]];
    for (let i = 0; i < this.userWeightHistory.length; i++) {
      const el = this.userWeightHistory[i];
      // @ts-ignore
      if (modeMap[el] == null) modeMap[el] = 1;
      // @ts-ignore
      else modeMap[el]++;
      // @ts-ignore  ]
      if (modeMap[el] > maxCount) {
        modes = [el];
        // @ts-ignore
        maxCount = modeMap[el];
        // @ts-ignore
      } else if (modeMap[el] === maxCount) {
        modes.push(el);
        // @ts-ignore
        maxCount = modeMap[el];
      }
    }

    // calculate the average of the last 100 weights
    const avg = this.userWeightHistory.reduce((a, b) => a + b, 0) / this.userWeightHistory.length;

    // calculate the standard deviation of the last 100 weights
    const std = Math.sqrt(
      this.userWeightHistory.reduce((sq, n) => sq + (n - avg) ** 2, 0)
        / (this.userWeightHistory.length - 1),
    );

    // calculate the threshold for the mode
    const threshold = std * 0.5;

    // filter the mode based on the threshold
    const filteredModes = modes.filter((mode) => Math.abs(mode - avg) < threshold);

    // return the average of the filtered mode
    return filteredModes.reduce((a, b) => a + b, 0) / filteredModes.length;
  }
}
