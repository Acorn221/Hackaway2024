export function toBigEndian(n, size) {
  const buffer = new Array();

  n.toString(16).match(/.{1,2}/g)?.map((x) => {
    const v = `0x${x}`;
    const a = Number(v);
    buffer.push(a);
  });

  return buffer;
}

export function numbersToBuffer(data) {
  return new Int8Array(data);
}

export function debug(buffer, print = true) {
  const a = Array.prototype.map.call(new Uint8Array(buffer), (x) => (`00${x.toString(16)}`).slice(-2)).join('-');
  if (print) console.log(a);
  return a;
}

export function getBitInByte(byte, index) {
  return byte & (1 << (index - 1));
}
