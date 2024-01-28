let lastWsNote = "";
let lastNote = "";
let lastMove = "";

let notesPlayed: string[] = [];
let noteHit = false;

type Direction =
  | "LEFT MOVE"
  | "RIGHT MOVE"
  | "FORWARD MOVE"
  | "BACKWARD MOVE"
  | "NEUTRAL MOVE"
  | "INVALID MOVE";

const PAD_WIDTH = 175;
const PAD_HEIGHT = 125;
const R = 10;
const GAP = 200;

function canvas_arrow(context, fromx, fromy, tox, toy) {
  var headlen = 10; // length of head in pixels
  var dx = tox - fromx;
  var dy = toy - fromy;
  var angle = Math.atan2(dy, dx);
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(
    tox - headlen * Math.cos(angle - Math.PI / 6),
    toy - headlen * Math.sin(angle - Math.PI / 6)
  );
  context.moveTo(tox, toy);
  context.lineTo(
    tox - headlen * Math.cos(angle + Math.PI / 6),
    toy - headlen * Math.sin(angle + Math.PI / 6)
  );
}

const h = () => window.innerHeight;
const w = () => window.innerWidth;

let dance1 = {
  id: -1,
  noteHit: false,
  movesPlayed: [] as string[],
  beatsSinceLastNote: 0,

  x: w() - GAP - PAD_WIDTH / 2,
  y: h() - GAP - PAD_HEIGHT / 2,

  score: 0,
};

let dance2 = {
  id: -1,
  noteHit: false,
  movesPlayed: [],
  beatsSinceLastNote: 0,

  x: w() - GAP - PAD_WIDTH / 2,
  y: GAP - PAD_HEIGHT / 2,

  score: 0,
};

let dance3 = {
  id: -1,
  noteHit: false,
  movesPlayed: [],
  beatsSinceLastNote: 0,

  x: GAP - PAD_WIDTH / 2,
  y: h() - GAP - PAD_HEIGHT / 2,

  score: 0,
};

let dance4 = {
  id: -1,
  noteHit: false,
  movesPlayed: [],
  beatsSinceLastNote: 0,

  x: GAP - PAD_WIDTH / 2,
  y: GAP - PAD_HEIGHT / 2,

  score: 0,
};

let dancePads = [dance1, dance2, dance3, dance4];

export function onLoad() {
  const ws = new WebSocket("ws://127.0.0.1:3000/ws");

  ws.onopen = () => {
    console.log("opened ws");
  };

  ws.onmessage = (e) => {
    const text = e.data;
    lastWsNote = text;

    notesPlayed.push(`${text[0]}`);
  };

  window.addEventListener("move", (e) => {
    console.log(e.detail);
    const boardMoves: { id: number; move: Direction } = e.detail;
    const index = boardMoves.id;
    dancePads[index].movesPlayed.push(boardMoves.move);
    dancePads[index].id = boardMoves.id;
  });

  window.requestAnimationFrame(loop);
}

// const notes = [
//   "A",
//   "A #",
//   "B",
//   "C",
//   "C #",
//   "D",
//   "D #",
//   "E",
//   "F",
//   "F #",
//   "G",
//   "G #",
// ];
//
// function genRandomNote() {
//   const noteIndex = Math.floor(Math.random() * notes.length);
//   return notes[noteIndex];
// }
//

function loop() {
  const canvas: HTMLCanvasElement = document.getElementById(
    "canvas"
  ) as HTMLCanvasElement;

  canvas.width = w();
  canvas.height = h();

  const context = canvas.getContext("2d")!;

  context.fillStyle = "#220055";
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (noteHit) {
    context.fillStyle = "lime";
  } else {
    context.fillStyle = "white";
  }

  context.font = "64px Comic Sans";
  context.fillText(lastNote, canvas.width / 2, canvas.height / 2);

  context.font = "32px Comic Sans";
  context.fillText(score.toString(), canvas.width / 2, canvas.height / 2 - 100);

  const nextMove = getNextMove();

  context.fillText("Next move", canvas.width / 2, canvas.height / 2 + 300);
  context.fillText(nextMove, canvas.width / 2, canvas.height / 2 + 350);

  // Dance pads

  for (const pad of dancePads) {
    if (pad.id === -1) continue;

    context.font = "32px Comic Sans";
    context.fillStyle = "red";
    context.fillText(pad.score.toString(), pad.x, pad.y + 200);

    context.fillStyle = "white";
    context.fillRect(pad.x, pad.y, PAD_WIDTH, PAD_HEIGHT);

    // context.fillStyle = "black";

    // const nextMove = getNextMove();

    // if (nextMove === "FORWARD MOVE") {
    //   context.arc(
    //     pad.x + PAD_WIDTH / 2,
    //     pad.y + PAD_HEIGHT / 4,
    //     R,
    //     0,
    //     2 * Math.PI
    //   );
    // } else if (nextMove === "BACKWARD MOVE") {
    //   context.arc(
    //     pad.x + PAD_WIDTH / 2,
    //     pad.y + (PAD_HEIGHT / 4) * 3,
    //     R,
    //     0,
    //     2 * Math.PI
    //   );
    // } else if (nextMove === "LEFT MOVE") {
    //   context.arc(
    //     pad.x + PAD_WIDTH / 4,
    //     pad.y + PAD_HEIGHT / 2,
    //     R,
    //     0,
    //     2 * Math.PI
    //   );
    // } else if (nextMove === "RIGHT MOVE") {
    //   context.arc(
    //     pad.x + (PAD_WIDTH / 4) * 3,
    //     pad.y + PAD_HEIGHT / 2,
    //     R,
    //     0,
    //     2 * Math.PI
    //   );
    // }
    // context.fill();

    if (pad.noteHit) {
      context.fillStyle = "lime";
    } else {
      context.fillStyle = "red";
    }

    context.beginPath();
    if (lastMove === "FORWARD MOVE") {
      context.arc(
        pad.x + PAD_WIDTH / 2,
        pad.y + PAD_HEIGHT / 4,
        R,
        0,
        2 * Math.PI
      );
    } else if (lastMove === "BACKWARD MOVE") {
      context.arc(
        pad.x + PAD_WIDTH / 2,
        pad.y + (PAD_HEIGHT / 4) * 3,
        R,
        0,
        2 * Math.PI
      );
    } else if (lastMove === "LEFT MOVE") {
      context.arc(
        pad.x + PAD_WIDTH / 4,
        pad.y + PAD_HEIGHT / 2,
        R,
        0,
        2 * Math.PI
      );
    } else if (lastMove === "RIGHT MOVE") {
      context.arc(
        pad.x + (PAD_WIDTH / 4) * 3,
        pad.y + PAD_HEIGHT / 2,
        R,
        0,
        2 * Math.PI
      );
    }

    context.fill();
  }

  window.requestAnimationFrame(loop);
}

const GUITAR_TRACK = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "E",
  "",
  "",
  "",
  "G",
  "",
  "",
  "",
  "A",
  "",
  "",
  "",
  "E",
  "",
  "",
  "",
  "G",
  "",
  "",
  "",
  "A #",
  "",
  "A",
  "",
  "",
  "",
  "",
  "",
  "A",
  "",
  "",
  "",
  "E",
  "",
  "",
  "",
  "G",
  "",
  "",
  "",
  "G",
  "",
  "E",
  "",
  "",
  "",
  "",
  "",
];

const DANCE_TRACK = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "LEFT MOVE",
  "",
  "",
  "",
  "RIGHT MOVE",
  "",
  "",
  "",
  "FORWARD MOVE",
  "",
  "",
  "",
  "LEFT MOVE",
  "",
  "",
  "",
  "RIGHT MOVE",
  "",
  "",
  "",
  "FORWARD MOVE",
  "",
  "BACKWARD MOVE",
  "",
  "",
  "",
  "",
  "",
  "",
  "FORWARD MOVE",
  "",
  "",
  "",
  "LEFT MOVE",
  "",
  "",
  "",
  "RIGHT MOVE",
  "",
  "",
  "",
  "BACKWARD MOVE",
  "",
  "",
  "",
  "FORWARD MOVE",
  "",
  "",
];

const BPM = 60;
const GAME_INTERVAL = (BPM / 60) * 4;
const INTERVAL = (1 / GAME_INTERVAL) * 1000;

let gameIndex = 0;
let beatsSinceLastNote = 0;

let score = 0;

function getNextMove() {
  let i = gameIndex + 1;
  while (true) {
    if (DANCE_TRACK[i % DANCE_TRACK.length].length > 0) {
      return DANCE_TRACK[i % DANCE_TRACK.length];
    }
    i++;
  }
}

setInterval(() => {
  const note = GUITAR_TRACK[gameIndex % GUITAR_TRACK.length];
  const danceMove = DANCE_TRACK[gameIndex % GUITAR_TRACK.length];

  beatsSinceLastNote++;
  gameIndex++;

  if (note.length > 0) {
    noteHit = false;
    lastNote = note;
    lastMove = danceMove;
    beatsSinceLastNote = 0;

    notesPlayed = [];

    for (const dance of dancePads) {
      dance.noteHit = false;
      dance.movesPlayed = [];
    }

    return;
  }

  if (note.length === 0) {
    if (beatsSinceLastNote > 10) {
      // notesPlayed = [];
      beatsSinceLastNote = 0;
      return;
    }

    for (const dance of dancePads) {
      if (dance.movesPlayed.includes(lastMove) && !dance.noteHit) {
        dance.noteHit = true;
        dance.movesPlayed = [];
        dance.score += Math.max(0, 4 - beatsSinceLastNote);
      }
    }

    if (notesPlayed.includes(lastNote) && !noteHit) {
      // the user has played the note.
      score += Math.max(0, 4 - beatsSinceLastNote);

      noteHit = true;
      notesPlayed = [];
    }
  }
}, INTERVAL);

window.onload = onLoad;
