let lastWsNote = "";
let lastNote = "";
let lastMove = "";

let notesPlayed = [];
let noteHit = false;

const PAD_WIDTH = 175;
const PAD_HEIGHT = 125;
const R = 10;
const GAP = 200;

const h = () => window.innerHeight;
const w = () => window.innerWidth;

let dance1 = {
  noteHit: false,
  movesPlayed: [],
  beatsSinceLastNote: 0,

  x: w() - GAP - PAD_WIDTH / 2,
  y: h() - GAP - PAD_HEIGHT / 2,
};

let dance2 = {
  noteHit: false,
  movesPlayed: [],
  beatsSinceLastNote: 0,

  x: w() - GAP - PAD_WIDTH / 2,
  y: GAP - PAD_HEIGHT / 2,
};

let dance3 = {
  noteHit: false,
  movesPlayed: [],
  beatsSinceLastNote: 0,

  x: GAP - PAD_WIDTH / 2,
  y: h() - GAP - PAD_HEIGHT / 2,
};

let dance4 = {
  noteHit: false,
  movesPlayed: [],
  beatsSinceLastNote: 0,

  x: GAP - PAD_WIDTH / 2,
  y: GAP - PAD_HEIGHT / 2,
};

let dancePads = [dance1, dance2, dance3, dance4];

function onLoad() {
  const ws = new WebSocket("ws://127.0.0.1:3000/ws");

  ws.onopen = () => {
    console.log("opened ws");
  };

  ws.onmessage = (e) => {
    const text = e.data;
    lastWsNote = text;

    notesPlayed.push(`${text[0]}`);
  };

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
  /**
   * Need to explain the purpose of X here.
   * @type {HTMLCanvasElement}
   */
  const canvas = document.getElementById("canvas");

  canvas.width = w();
  canvas.height = h();

  const context = canvas.getContext("2d");

  context.fillStyle = "#220055";
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (noteHit) {
    context.fillStyle = "lime";
  } else {
    context.fillStyle = "white";
  }
  context.font = "64px Comic Sans";
  context.fillText(lastNote, canvas.width / 2, canvas.height / 2);

  // make flash

  context.fillStyle = "white";
  context.font = "32px Comic Sans";
  context.fillText(lastWsNote, 150, 100);

  // Dance pads

  for (const pad of dancePads) {
    context.fillStyle = "white";
    context.fillRect(pad.x, pad.y, PAD_WIDTH, PAD_HEIGHT);

    debugger;

    context.fillStyle = "red";
    context.beginPath();
    if (lastMove === "UP") {
      context.arc(
        pad.x + PAD_WIDTH / 2,
        pad.y + PAD_HEIGHT / 4,
        R,
        0,
        2 * Math.PI
      );
    } else if (lastMove === "BOTTOM") {
      context.arc(
        pad.x + PAD_WIDTH / 2,
        pad.y + (PAD_HEIGHT / 4) * 3,
        R,
        0,
        2 * Math.PI
      );
    } else if (lastMove === "LEFT") {
      context.arc(
        pad.x + PAD_WIDTH / 4,
        pad.y + PAD_HEIGHT / 2,
        R,
        0,
        2 * Math.PI
      );
    } else if (lastMove === "RIGHT") {
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
  "LEFT",
  "",
  "",
  "",
  "RIGHT",
  "",
  "",
  "",
  "UP",
  "",
  "",
  "",
];

const BPM = 100;
const GAME_INTERVAL = (BPM / 60) * 4;
const INTERVAL = (1 / GAME_INTERVAL) * 1000;

let gameIndex = 0;
let beatsSinceLastNote = 0;

let score = 0;

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
        score += Math.max(0, 10 - beatsSinceLastNote);
      }
    }

    if (notesPlayed.includes(lastNote) && !noteHit) {
      // the user has played the note.
      score += Math.max(0, 10 - beatsSinceLastNote);

      noteHit = true;
      notesPlayed = [];
    }
  }
}, INTERVAL);
