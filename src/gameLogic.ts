let lastWsNote = '';
let lastNote = '';
let lastMove = '';

let notesPlayed = [];
let noteHit = false;

const dance1 = {
  noteHit: false,
  movesPlayed: [],
  beatsSinceLastNote: 0,
};

const dancePads = [dance1];

export function onLoad() {
  const ws = new WebSocket('ws://127.0.0.1:3000/ws');

  ws.onopen = () => {
    console.log('opened ws');
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
const h = () => window.innerHeight;
const w = () => window.innerWidth;

function loop() {
  /**
   * Need to explain the purpose of X here.
   * @type {HTMLCanvasElement}
   */
  const canvas = document.getElementById('canvas');

  canvas.width = w();
  canvas.height = h();

  const context = canvas.getContext('2d');

  context.fillStyle = '#220055';
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (noteHit) {
    context.fillStyle = 'lime';
  } else {
    context.fillStyle = 'white';
  }
  context.font = '64px Comic Sans';
  context.fillText(lastNote, canvas.width / 2, canvas.height / 2);

  // make flash

  context.fillStyle = 'white';
  context.font = '32px Comic Sans';
  context.fillText(lastWsNote, 150, 100);

  // Dance pads

  context.fillRect(100, 100, 100, 100);
  if (lastMove === 'TOP LEFT') {
    context.arc(25, 25, 10, 0, 2 * Math.PI);
  } else if (lastMove === 'TOP RIGHT') {
    context.arc(75, 25, 10, 0, 2 * Math.PI);
  } else if (lastMove === 'BOTTOM LEFT') {
    context.arc(25, 75, 10, 0, 2 * Math.PI);
  } else if (lastMove === 'BOTTOM RIGHT') {
    context.arc(75, 75, 10, 0, 2 * Math.PI);
  }

  window.requestAnimationFrame(loop);
}

const GUITAR_TRACK = [
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  'E',
  '',
  '',
  '',
  'G',
  '',
  '',
  '',
  'A',
  '',
  '',
  '',
];

const DANCE_TRACK = [
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  'TOP LEFT',
  '',
  '',
  '',
  'TOP RIGHT',
  '',
  '',
  '',
  'BOTTOM RIGHT',
  '',
  '',
  '',
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

  console.log(note);
}, INTERVAL);

