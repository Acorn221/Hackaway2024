/* eslint-disable no-case-declarations */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
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

  calibration: number[][];

  constructor(device: HIDDevice) {
    super(device);

    this.WeightListener = null;
    this.weights = {
      TOP_RIGHT: 0,
      BOTTOM_RIGHT: 1,
      TOP_LEFT: 2,
      BOTTOM_LEFT: 3,
    };

    this.calibration = [
      [10000.0, 10000.0, 10000.0, 10000.0],
      [10000.0, 10000.0, 10000.0, 10000.0],
      [10000.0, 10000.0, 10000.0, 10000.0],
    ];
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
}
