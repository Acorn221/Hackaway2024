package main

import (
	"fmt"
	"math"
	"math/cmplx"
	"net/http"
	"slices"

	"github.com/gordonklaus/portaudio"
	"github.com/gorilla/websocket"
	"gonum.org/v1/gonum/dsp/fourier"
)

func IsAllEqual(slice []float64, val float64) bool {
	for _, v := range slice {
		if v != val {
			return false
		}
	}
	return true
}

func MostCommon(slice []Note) Note {
	m := make(map[Note]int)

	for _, s := range slice {
		_, exists := m[s]
		if exists {
			m[s] += 1
		} else {
			m[s] = 1
		}
	}

	maxNote := Note{}
	maxNoteCounter := 0

	for k, v := range m {
		if v > maxNoteCounter {
			maxNoteCounter = v
			maxNote = k
		}
	}

	return maxNote
}

func main() {
	portaudio.Initialize()
	defer portaudio.Terminate()

	stream, err := portaudio.OpenDefaultStream(1, 0, 44100, 1024, processAudio)
	if err != nil {
		panic(err)
	}
	defer stream.Close()

	findNote()

	// ticker := time.NewTicker(time.Millisecond * 200)
	// go func() {
	// 	for range ticker.C {
	// 		if Con == nil {
	// 			continue
	// 		}
	//
	// 		common := MostCommon(previousNotes)
	// 		n := notes[common.RealFreq]
	// 		if len(n) == 0 {
	// 			continue
	// 		}
	//
	// 		Con.WriteMessage(websocket.TextMessage, []byte(n))
	// 		previousNotes = make([]Note, 0)
	// 	}
	// }()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(w, r)
	})

	go func() {
		http.ListenAndServe(":3000", nil)
	}()

	err = stream.Start()
	if err != nil {
		panic(err)
	}

	fmt.Scanln()

	err = stream.Stop()
	if err != nil {
		panic(err)
	}

}

var upgrader = websocket.Upgrader{
	// CORS, for now just allow all origins
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var Con *websocket.Conn

func serveWs(w http.ResponseWriter, r *http.Request) {
	con, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	Con = con
}

var NOISE float64 = 0.1
var previousNotes []Note

func processAudio(in []float32) {
	// Convert float32 slice to a complex128 slice as required by the FFT function
	fftInput := make([]float64, len(in))
	for i, v := range in {

		// Magic noise number
		if math.Abs(float64(v)) < NOISE {
			v = 0
		}

		fftInput[i] = float64(v)
	}

	fft := fourier.NewFFT(len(fftInput))
	coefficients := fft.Coefficients(nil, fftInput)
	dominantFreq := findDominantFrequency(coefficients, 44100)

	for _, v := range noteList {
		if v.IsNote(dominantFreq) {
			note := notes[v.RealFreq]
			fmt.Println("Note: " + note)
			if Con != nil {
				Con.WriteMessage(websocket.TextMessage, []byte(note))
			}
			break
		}
	}
}

type Note struct {
	RealFreq float64
	min      float64
	max      float64
}

func (n Note) IsNote(freq float64) bool {
	return freq > n.min && freq < n.max
}

var noteList []Note

var notes map[float64]string = map[float64]string{
	16.35:   "C 0",
	17.32:   "C # 0",
	18.35:   "D 0",
	19.45:   "D # 0",
	20.60:   "E 0",
	21.83:   "F 0",
	23.12:   "F # 0",
	24.50:   "G 0",
	25.96:   "G # 0",
	27.50:   "A 0",
	29.14:   "A # 0",
	30.87:   "B 0",
	32.70:   "C 1",
	34.65:   "C # 1",
	36.71:   "D 1",
	38.89:   "D # 1",
	41.20:   "E 1",
	43.65:   "F 1",
	46.25:   "F # 1",
	49.00:   "G 1",
	51.91:   "G # 1",
	55.00:   "A 1",
	58.27:   "A # 1",
	61.74:   "B 1",
	65.41:   "C 2",
	69.30:   "C # 2",
	73.42:   "D 2",
	77.78:   "D # 2",
	82.41:   "E 2",
	87.31:   "F 2",
	92.50:   "F # 2",
	98.00:   "G 2",
	103.83:  "G # 2",
	110.00:  "A 2",
	116.54:  "A # 2",
	123.47:  "B 2",
	130.81:  "C 3",
	138.59:  "C # 3",
	146.83:  "D 3",
	155.56:  "D # 3",
	164.81:  "E 3",
	174.61:  "F 3",
	185.00:  "F # 3",
	196.00:  "G 3",
	207.65:  "G # 3",
	220.00:  "A 3",
	233.08:  "A # 3",
	246.94:  "B 3",
	261.63:  "C 4",
	277.18:  "C # 4",
	293.66:  "D 4",
	311.13:  "D # 4",
	329.63:  "E 4",
	349.23:  "F 4",
	369.99:  "F # 4",
	392.00:  "G 4",
	415.30:  "G # 4",
	440.00:  "A 4",
	466.16:  "A # 4",
	493.88:  "B 4",
	523.25:  "C 5",
	554.37:  "C # 5",
	587.33:  "D 5",
	622.25:  "D # 5",
	659.25:  "E 5",
	698.46:  "F 5",
	739.99:  "F # 5",
	783.99:  "G 5",
	830.61:  "G # 5",
	880.00:  "A 5",
	932.33:  "A # 5",
	987.77:  "B 5",
	1046.50: "C 6",
	1108.73: "C # 6",
	1174.66: "D 6",
	1244.51: "D # 6",
	1318.51: "E 6",
	1396.91: "F 6",
	1479.98: "F # 6",
	1567.98: "G 6",
	1661.22: "G # 6",
	1760.00: "A 6",
	1864.66: "A # 6",
	1975.53: "B 6",
	2093.00: "C 7",
	2217.46: "C # 7",
	2349.32: "D 7",
	2489.02: "D # 7",
	2637.02: "E 7",
	2793.83: "F 7",
	2959.96: "F # 7",
	3135.96: "G 7",
	3322.44: "G # 7",
	3520.00: "A 7",
	3729.31: "A # 7",
	3951.07: "B 7",
	4186.01: "C 8",
	4434.92: "C # 8",
	4698.63: "D 8",
	4978.03: "D # 8",
	5274.04: "E 8",
	5587.65: "F 8",
	5919.91: "F # 8",
	6271.93: "G 8",
	6644.88: "G # 8",
	7040.00: "A 8",
	7458.62: "A # 8",
	7902.13: "B 8",
}

func findNote() {
	noteFreqArray := make([]float64, len(notes))
	i := 0

	for k := range notes {
		noteFreqArray[i] = k
		i++
	}

	slices.Sort(noteFreqArray)

	noteList = make([]Note, len(notes)-2)

	for i := 1; i < len(noteFreqArray)-1; i++ {
		diffLow := noteFreqArray[i] - noteFreqArray[i-1]
		diffHigh := noteFreqArray[i+1] - noteFreqArray[i]

		note := Note{min: noteFreqArray[i] - diffLow/2, max: noteFreqArray[i] + diffHigh/2, RealFreq: noteFreqArray[i]}

		noteList[i-1] = note
	}
}

func findDominantFrequency(coeffs []complex128, sampleRate int) float64 {
	maxMag := 0.0
	index := 0
	for i, coeff := range coeffs {
		mag := cmplx.Abs(coeff)
		if mag > maxMag {
			maxMag = mag
			index = i
		}
	}

	// Calculate the frequency
	freq := float64(index) * float64(sampleRate) / float64(len(coeffs))
	return freq
}
