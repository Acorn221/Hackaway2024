/* eslint-disable no-array-constructor */
export function toBigEndian(n: any, _size: number) {
  const buffer = new Array();

  n.toString(16).match(/.{1,2}/g)?.forEach((x: any) => {
    const v = `0x${x}`;
    const a = Number(v);
    buffer.push(a);
  });

  return buffer;
}

export function numbersToBuffer(data: number[]) {
  return new Int8Array(data);
}

export function debug(buffer: any, print = true) {
  const a = Array.prototype.map.call(new Uint8Array(buffer), (x) => (`00${x.toString(16)}`).slice(-2)).join('-');
  if (print) console.log(a);
  return a;
}

export function getBitInByte(byte: any, index: any) {
  return byte & (1 << (index - 1));
}
