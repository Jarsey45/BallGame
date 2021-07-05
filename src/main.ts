//IMPORTS 
import { Ball } from './Ball';
import { Pole } from './Pole';
import * as global from './Globals'
import p5 from 'p5';

//VARIABLES
const containerElement: HTMLElement | null = document.getElementById('root');
export class GlobalVars {
  public static clickedBall: Pole | null = null;
  public static openSet: Pole[] = [];
  public static closedSet: Pole[] = [];
  public static startNode: Pole | null = null;
  public static endNode: Pole | null = null;
  public static path: Pole[] = [];
  public static done: boolean = false;
  public static cantFind: boolean = false;
  public static gameTable: Pole[][] = [];
  public static needUpdate: boolean = true;
  public static Score: number = 0;
  public static end: boolean = false;

  public static reset() {
    this.clickedBall = null;
    this.openSet = [];
    this.closedSet = [];
    this.startNode = null;
    this.endNode = null;
    this.done = false;
    this.cantFind = false;
    this.end = false;
    // this.gameTable = [];
    for (let i of GlobalVars.gameTable)
      for (let pola of i)
        pola.prev = undefined;
  }

  public static resetPrev() {
    this.openSet = [];
    this.closedSet = [];
    this.startNode = null;
    this.endNode = null;
    //this.done = false;
    this.cantFind = false;
    // this.gameTable = [];
    for (let i of GlobalVars.gameTable)
      for (let pola of i)
        pola.prev = undefined;
  }
}
let gameSize: number = 9;
let gColor = genColors();
let gBall = genBalls();
let oldColor: global.hexColor[];

//P5 SKETCH IN INSTACED MODE 
const sketch = (p: p5) => {
  let color = 255;

  p.setup = function () {
    p.createCanvas(global.GAME_WIDTH, global.GAME_HEIGHT);


    for (let i = 0; i < gameSize; i++) {
      GlobalVars.gameTable[i] = new Array(9);
      for (let j = 0; j < gameSize; j++)
        GlobalVars.gameTable[i][j] = new Pole(p, { y: i, x: j }, { x: global.GAME_WIDTH / 12 * j + 100, y: global.GAME_HEIGHT / 9 * i });
    }

    for (let i of GlobalVars.gameTable)
      for (let pola of i)
        pola.addNeighbors(GlobalVars.gameTable);

    let nextC = gColor.next().value;
    if (nextC) {
      oldColor = JSON.parse(JSON.stringify(nextC));
      for (let i = 0; i < nextC.length; i++) {
        changeNextDivs(oldColor);
      };
    }

    GlobalVars.gameTable[0][0].addBall(oldColor[0]);
    GlobalVars.gameTable[5][2].addBall(oldColor[1]);

    // for (let i of gameTable)
    //   for (let pola of i)
    //     console.log(pola.neighbors);

  };

  p.draw = function () {
    p.background(98, 98, 205);
    p.fill(color);


    for (let i of GlobalVars.gameTable) // wyseitlanie
      for (let pola of i)
        pola.show();




    if (GlobalVars.needUpdate) { // UPDATE CALEJ GRY
      //sprawdzanie czy w zdobyte punkty
      let isScore = checkIfScore();
      changeScore();




      if (!isScore) { // jezeli zdobylismy punkty nie losuj nowych kul 
        //kolory
        let c = gColor.next().value;
        let b = gBall.next().value;
        if (b && c) {
          for (let i = 0; i < b.length; i++) {
            changeNextDivs(c);
            b[i].addBall(oldColor[i]);
          }
          oldColor = JSON.parse(JSON.stringify(c));
        }
      }
      GlobalVars.needUpdate = false;


      checkIfEnd();
    }

    //p.rect(p.mouseX - 25, p.mouseY - 25, 50, 50);
  };

  p.mouseMoved = function () { // preview
    for (let i of GlobalVars.gameTable)
      for (let pola of i)
        pola.previewPath();
  };

  p.mousePressed = function () {
    for (let i of GlobalVars.gameTable)
      for (let pola of i)
        pola.clicked();
  };
};


//MAKING WHOLE SKETCH
if (containerElement)
  var myp5: p5 = new p5(sketch, containerElement);


let bStart = document.getElementById('bStart');
bStart?.addEventListener('click', function () {
  GlobalVars.Score = 0;
  GlobalVars.needUpdate = true;
  GlobalVars.reset();
  for (let i of GlobalVars.gameTable)
    for (let pola of i)
      pola.reset();
  GlobalVars.gameTable[0][0].addBall(oldColor[0]);
  GlobalVars.gameTable[5][2].addBall(oldColor[1]);

})


function changeNextDivs(color: global.hexColor[]) {
  for (let i = 0; i < color.length; i++) {
    (document.getElementsByClassName('kula')[i] as HTMLElement).style.background = `rgb(${color[i].r},${color[i].g},${color[i].b})`;
  };
}

function checkIfEnd() {
  let arr = GlobalVars.gameTable.flat();
  for (let pola of arr) { // sprawdzanie czy przegralsimy
    if (pola.isEmpty) { // puste pole
      GlobalVars.end = false;
      break;
    } else { // nie puste
      GlobalVars.end = true;
    }

  }


  if (GlobalVars.end == true) {
    console.log(GlobalVars.end)
    alert(`Przegrałes :( \n twoja liczba punktów: ${GlobalVars.Score}`)
    document.getElementById('bStart')?.click();
  }
}


//Color gen
function* genColors() {
  while (global.isGameLive) {
    let tab = [];
    for (let i = 0; i < 3; i++)
      tab.push(global.COLORS[Math.floor(Math.random() * global.COLORS.length)])
    yield tab;
  }

}

//BALLS GENERATOR
function* genBalls() {
  while (global.isGameLive) {
    let yd: Array<Pole> = [];
    let arr = GlobalVars.gameTable.flat();
    let indexes = Array.from(Array(arr.length).keys());
    for (let i = 0; i < 3; i++) {
      let availableIndex = indexes.filter((index) => arr[index].isEmpty != false);
      let selectRandomIndex = availableIndex[Math.floor(Math.random() * availableIndex.length)];
      if (yd.length == 0) {
        arr[selectRandomIndex].isEmpty = false;
        yd.push(arr[selectRandomIndex]);
      } else {
        let good = true;
        for (let el of yd) {
          if (el == arr[selectRandomIndex])
            good = false;
        }
        if (good && arr[selectRandomIndex]) {
          arr[selectRandomIndex].isEmpty = false;
          yd.push(arr[selectRandomIndex]);
        }
      }
    }


    yield yd;
  }
}

//sprawdzanie czy ulozylismy linie
function checkIfScore(): boolean {
  let hor = [], ver = [], diag1 = [], diag2 = [];
  let kulki = [];
  let isScore = false;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (!GlobalVars.gameTable[i][j].isEmpty) {
        kulki.push(GlobalVars.gameTable[i][j])
      }
    }
  }

  for (let kula of kulki) {
    let h = [], v = [], d1 = [], d2 = [];
    let i = kula.i;
    let j = kula.j;

    //sprawdzanie horyzontoalne
    h.push(kula);
    for (let x = 1; x < 9; x++) {
      if (GlobalVars.gameTable[i][j + x] &&
        !GlobalVars.gameTable[i][j + x].isEmpty //&& GlobalVars.gameTable[i][j + x] != kula
      ) {
        if (JSON.stringify(GlobalVars.gameTable[i][j + x].bColor) == JSON.stringify(kula.bColor)) {
          if (!h.includes(GlobalVars.gameTable[i][j + x]))
            h.push(GlobalVars.gameTable[i][j + x])
          //console.log('aaaa')
        } else {
          break;
        }
      } else {
        break;
      }
    }
    hor.push(h);
    h = [];
    //sprawdzanie horyzontoalne

    //sprawdzanie wertykalne
    v.push(kula);
    for (let y = 1; y < 9; y++) {
      if (GlobalVars.gameTable[i + y] &&
        GlobalVars.gameTable[i + y][j] &&
        !GlobalVars.gameTable[i + y][j].isEmpty //&& GlobalVars.gameTable[i][j + x] != kula
      ) {
        if (JSON.stringify(GlobalVars.gameTable[i + y][j].bColor) == JSON.stringify(kula.bColor)) {
          if (!v.includes(GlobalVars.gameTable[i + y][j]))
            v.push(GlobalVars.gameTable[i + y][j]);
          //console.log('aaaa')

        } else {
          break;
        }
      } else {
        break;
      }
    }
    ver.push(v);
    v = [];
    //sprawdzanie wertykalne

    //sprawdzanie na wskros
    d1.push(kula);
    for (let xy = 1; xy < 9; xy++) {
      if (GlobalVars.gameTable[i + xy] &&
        GlobalVars.gameTable[i + xy][j + xy] &&
        !GlobalVars.gameTable[i + xy][j + xy].isEmpty //&& GlobalVars.gameTable[i][j + x] != kula
      ) {
        if (JSON.stringify(GlobalVars.gameTable[i + xy][j + xy].bColor) == JSON.stringify(kula.bColor)) {
          if (!d1.includes(GlobalVars.gameTable[i + xy][j + xy]))
            d1.push(GlobalVars.gameTable[i + xy][j + xy])
          //console.log('aaaa')
        } else {
          break;
        }
      } else {
        break;
      }
    }
    diag1.push(d1);
    d1 = [];
    //sprawdzanie na wskros

    //sprawdzanie na wskros
    d2.push(kula);
    for (let xy = 1; xy < 9; xy++) {
      if (GlobalVars.gameTable[i - xy] &&
        GlobalVars.gameTable[i - xy][j + xy] &&
        !GlobalVars.gameTable[i - xy][j + xy].isEmpty //&& GlobalVars.gameTable[i][j + x] != kula
      ) {
        if (JSON.stringify(GlobalVars.gameTable[i - xy][j + xy].bColor) == JSON.stringify(kula.bColor)) {
          if (!d2.includes(GlobalVars.gameTable[i - xy][j + xy]))
            d2.push(GlobalVars.gameTable[i - xy][j + xy])
          //console.log('aaaa')
        } else {
          break;
        }
      } else {
        break;
      }
    }
    diag2.push(d2);
    d2 = [];
    //sprawdzanie na wskros
  }

  //sprawdzanie horyzontoalne
  const toDeleteH = hor.filter(e => e.length > 4);
  if (toDeleteH.length > 0)
    isScore = true
  for (let el of toDeleteH)
    for (let pole of el)
      pole.scorePoints();
  //sprawdzanie horyzontoalne

  //sprawdzanie wertykalne
  const toDeleteV = ver.filter(e => e.length > 4);
  if (toDeleteV.length > 0)
    isScore = true
  for (let el of toDeleteV)
    for (let pole of el)
      pole.scorePoints();
  //sprawdzanie wertykanlen

  //sprawdzanie na wskros 1
  const toDeleteD1 = diag1.filter(e => e.length > 4);
  if (toDeleteD1.length > 0)
    isScore = true
  for (let el of toDeleteD1)
    for (let pole of el)
      pole.scorePoints();
  //sprawdzanie na wskros 1

  //sprawdzanie na wskros 2
  const toDeleteD2 = diag2.filter(e => e.length > 4);
  if (toDeleteD2.length > 0)
    isScore = true
  for (let el of toDeleteD2)
    for (let pole of el)
      pole.scorePoints();
  //sprawdzanie na wskros 2

  if (isScore)
    return true
  else
    return false


}

function changeScore() {
  let s = document.getElementById('score');
  if (s)
    s.innerHTML = GlobalVars.Score.toString();
}