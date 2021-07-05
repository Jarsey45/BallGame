export var GAME_HEIGHT: number = 600;//600
export var GAME_WIDTH: number = 800;//800
//console.log(GAME_WIDTH, GAME_HEIGHT)
export const SEED: number = Math.random();
export const COLORS: hexColor[] = [
  { r: 255, g: 255, b: 0 },//yellow
  { r: 255, g: 20, b: 147 },//deeppink
  { r: 220, g: 220, b: 220 },//gainsboro grey
  { r: 0, g: 0, b: 0 }, //black
  { r: 255, g: 0, b: 0 },//red
  { r: 0, g: 0, b: 255 },//blue
  { r: 0, g: 255, b: 0 }//green
]
export var isGameLive: boolean = true;
export interface position {
  x: number,
  y: number
}
export interface hexColor {
  r: number,
  g: number,
  b: number
}

// window.addEventListener('resize', function () {
//   GAME_HEIGHT = getHeight() / 1.5;
//   GAME_WIDTH = getWidth() / 3;
//   console.log(GAME_WIDTH)
// })


function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

function getHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}