const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")
const startButton = document.querySelector("#start")
const clearButton = document.querySelector("#clear")
const pauseButton = document.querySelector("#pause")
const randomButton = document.querySelector("#random")
const speedSelect = document.querySelector("#speed")
const sound = document.querySelector("#sound")

let resolution = 20
let speed = parseInt(speedSelect.value)

canvas.width = 400
canvas.height = 400
canvas.addEventListener('click', handleClick)

let COLS = canvas.width / resolution;
let ROWS = canvas.height / resolution;
let timeoutIds = []
let grid

grid = buildGrid()
render(grid)


// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioCtx.createGain()
gainNode.gain.value=0.006



function buildGrid() {
  return new Array(COLS).fill(null)
    .map(() => new Array(ROWS).fill(null)
      .map(() => Math.floor(Math.random() * 2))
    )
}
function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const clickedRow = Math.floor(mouseY / resolution);
  const clickedCol = Math.floor(mouseX / resolution);
  grid[clickedCol][clickedRow] = 1 - grid[clickedCol][clickedRow]
  render(grid)
}



startButton.addEventListener("click", () => {
  clearTimeouts()
  update()
})
clearButton.addEventListener("click", () => {
  clearTimeouts()
  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      grid[col][row] = 0
    }
  }
  render(grid)
})
pauseButton.addEventListener("click", () => {
  clearTimeouts()
})
randomButton.addEventListener("click", () => {
  grid = buildGrid()
  render(grid)
})

speedSelect.addEventListener("change", () => {
  speed = speedSelect.value
  clearTimeouts()
  // update()
})


function clearTimeouts() {
  timeoutIds.forEach(id => clearTimeout(id))
  timeoutIds = []
}
function update() {
  grid = nextGen(grid)
  render(grid)
  let timeoutId = setTimeout(() => {
    update()
  }, parseInt(speed))
  timeoutIds.push(timeoutId)
}
function nextGen(grid) {

  const nextGen = grid.map(arr => [...arr])
  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      const cell = grid[col][row]
      let numNeighbors = 0;
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (i == 0 && j == 0) {
            continue;
          }
          const x_cell = col + i;
          const y_cell = row + j;

          if (x_cell >= 0 && y_cell >= 0 && x_cell < COLS && y_cell < ROWS) {
            const currentNeighbor = grid[col + i][row + j]
            numNeighbors += currentNeighbor
          }

        }
      }
      //rules
      if (cell === 1) {
        if (numNeighbors < 2) {
          nextGen[col][row] = 0
        } else if (numNeighbors > 3) {
          nextGen[col][row] = 0
        }
      } else {
        if (numNeighbors == 3) {
          if(col<COLS && row<ROWS ) {
            nextGen[col][row] = 1
          }


          if (sound.checked) {
            // create Oscillator node
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'sine'
            const baseFrequency = [65.41,87.31,116.54,155.56,207.65,277.18,369.99,493.88,659.26,880,1174.66,1567.98];
            const scaleDegrees = [0,2,4,7,9,12
              // ,14,16,19,21,24
            ]; //pentatonic notes within two octaves
            const scaleDegreeIndex = Math.floor((col/COLS)*scaleDegrees.length);
            const scaleDegree = scaleDegrees[scaleDegreeIndex];
            oscillator.frequency.value = baseFrequency[Math.floor((row/ROWS)*12)]*2 *Math.pow(2, scaleDegree / 12)
            oscillator.connect(gainNode).connect(audioCtx.destination);
  
            oscillator.start();
            setTimeout(() => {
              oscillator.stop()
            }, speed)

          }




        }
      }
    }
  }
  return nextGen
}
function render(grid) {
  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      const cell = grid[col][row]

      ctx.beginPath()
      ctx.rect(col * resolution, row * resolution, resolution, resolution)
      ctx.fillStyle = cell ? 'black' : 'white'
      ctx.fill()
      // ctx.stroke()
    }
  }
}
