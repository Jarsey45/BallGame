import { position, GAME_HEIGHT, GAME_WIDTH, hexColor } from './Globals';
import { GlobalVars } from './main';
import { Ball } from './Ball';
import { Log } from './decorators/logDecorator'
import p5 from 'p5';

var nextMove = true;

export class Pole {
  private p: p5;
  private height: number;
  private width: number;
  private ballColor: hexColor;
  public f: number;
  public g: number;
  public h: number;
  public i: number;
  public j: number;
  protected pos: position;
  protected isPreviewed: boolean;
  public isEmpty: boolean;
  public ball: Ball | null;
  public color: hexColor;
  public prev: Pole | undefined;
  public neighbors: Pole[];

  constructor(p: p5, xy: { x: number, y: number }, pos: position, isEmpty?: boolean) {
    this.p = p;
    this.i = xy.y;
    this.j = xy.x;
    this.pos = pos;
    this.isEmpty = isEmpty ? isEmpty : true;
    this.width = GAME_WIDTH / 12;
    this.height = GAME_HEIGHT / 9;
    this.color = { r: 205, g: 96, b: 96 };
    this.ball = null;
    this.neighbors = [];
    this.ballColor = { r: 255, g: 0, b: 0 }; // red default 
    this.g = 0;
    this.f = 0;
    this.h = 0;
    this.prev = undefined;
    this.isPreviewed = false;
  }

  show() {
    if (GlobalVars.clickedBall == this) {
      this.p.fill(51)
    } else if (this.isPreviewed == true) {
      if (GlobalVars.clickedBall == null)
        this.isPreviewed = false;

      this.p.fill(96, 205, 96)
    } else {
      this.p.fill(this.color.r, this.color.g, this.color.b)
    }
    this.p.rect(this.pos.x, this.pos.y, this.width, this.height);

    if (!this.isEmpty && this.ball != null)
      this.ball.show();
  }

  clicked() {
    if (pointRect(this.p.mouseX, this.p.mouseY, this.pos.x, this.pos.y, this.width, this.height)) {
      if (this.isEmpty && nextMove) { // puste miejsce
        if (GlobalVars.clickedBall != null) { // jest zaznaczona kula 
          //console.log('jest zaznaczona kuli i kliknales na puste')
          nextMove = false;
          this.makePath();
        } else { // nie ma zazanczonej kuli
          //console.log('nie ma zaznaczonej kuli i kliknales na puste')
        }

      } else if (!this.isEmpty && nextMove) { // miejsce z kula
        if (GlobalVars.clickedBall != null) { // jest zaznaczona kula
          GlobalVars.clickedBall = this;
          //console.log('jest zaznaczonej kuli i kliknales na kule')
        } else { // nie ma zaznaczonej kuli
          GlobalVars.clickedBall = this;
          //console.log('nie ma zaznaczonej kuli i kliknales na kule')
        }
      }
    }
  }

  makePath() {
    GlobalVars.startNode = GlobalVars.clickedBall;
    GlobalVars.endNode = this;
    if (GlobalVars.clickedBall)
      GlobalVars.openSet.push(GlobalVars.clickedBall);
    GlobalVars.done = false;
    //console.log('szukam sciezki')
    while (!GlobalVars.done && !GlobalVars.cantFind) {
      Astar();
    }

    if (!GlobalVars.cantFind) { // znaleziono sceizke
      for (let element of GlobalVars.path) {//show path
        element.showPath();
      }
      GlobalVars.endNode.showPath();

      swapBall(GlobalVars.startNode as Pole, GlobalVars.endNode);
    } else { // nie znaleziono sciezki
      nextMove = true;
    }
    GlobalVars.reset();

    //console.log('skonczone szukanie sciezki')
  }

  previewPath() {
    if (GlobalVars.clickedBall &&
      pointRect(this.p.mouseX, this.p.mouseY, this.pos.x, this.pos.y, this.width, this.height) &&
      GlobalVars.clickedBall != this) {
      GlobalVars.startNode = GlobalVars.clickedBall;
      GlobalVars.endNode = this;
      //@ts-ignore
      GlobalVars.openSet.push(GlobalVars.clickedBall);
      GlobalVars.done = false;
      //console.log('szukam sciezki')
      while (!GlobalVars.done && !GlobalVars.cantFind) {
        Astar();
      }

      if (!GlobalVars.cantFind) { // znaleziono sceizke
        for (let element of GlobalVars.gameTable.flat()) {//show path
          if (GlobalVars.path.includes(element))
            element.showPathPrev(true);
          else {
            element.showPathPrev(false);
          }
        }
        GlobalVars.endNode.showPathPrev(true);

      }
      GlobalVars.resetPrev();
    }
  }

  showPath() {
    this.color = { r: 96, g: 205, b: 96 };
    setTimeout(() => {
      this.color = { r: 205, g: 96, b: 96 };
      GlobalVars.needUpdate = true;
      nextMove = true;
    }, 500);
  }

  showPathPrev(toggle: boolean) {
    if (toggle)
      this.isPreviewed = true;
    else
      this.isPreviewed = false;

  }

  addNeighbors(tab: Pole[][]) { // dodaje somsiaduw xd
    if (this.i < tab.length - 1) {
      this.neighbors.push(tab[this.i + 1][this.j]);
    }
    if (this.i > 0) {
      this.neighbors.push(tab[this.i - 1][this.j]);
    }
    if (this.j < tab[0].length - 1) {
      this.neighbors.push(tab[this.i][this.j + 1]);
    }
    if (this.j > 0) {
      this.neighbors.push(tab[this.i][this.j - 1]);
    }
  }


  addBall(color: hexColor): void {
    this.ballColor = color;
    this.isEmpty = false;
    this.ball = new Ball(this.p, this.pos, color);
  }

  @Log()
  deleteBall(): void {

    this.ball = null;
    this.isEmpty = true;
    this.ballColor = { r: 255, g: 0, b: 0 };

  }


  scorePoints() {
    if (this.ball != null) {
      GlobalVars.Score += 1;
      this.deleteBall();
    }
  }

  reset() {
    this.deleteBall();

  }

  get bColor(): hexColor {
    return this.ballColor;
  }

}


function pointRect(px: number, py: number, rx: number, ry: number, rw: number, rh: number): boolean {
  return (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh)
}

function Astar() { //sam algorytm
  //console.log('pierdoli sie tu')
  if (GlobalVars.openSet.length > 0 && !GlobalVars.done) { // dopoki openSet nie jest pusty
    let LFScore = 0; //to taka nasza flaga najwiekszego FScore
    //console.log("TUTAJ poczatek pierwszy if true")
    for (let i = 0; i < GlobalVars.openSet.length; i++) { // loop
      if (GlobalVars.openSet[i].f < GlobalVars.openSet[LFScore].f) { //sprawdzamy czy ktorys z open set ma lepszy Fscore
        LFScore = i; // ustawiamy lepszy fScore na nowy
      }
    }
    var curr: Pole = GlobalVars.openSet[LFScore]; // aktualnie sprawdzany jest nowy element z leposzym Fscore 
    //console.log("TUTAJ curr")
    if (curr == GlobalVars.endNode) { // jezeli nasz nowy element jest koncem to konczyy
      //console.log("DONE!!!")
      GlobalVars.done = true;//skjonczone
      //clearInterval(draw);
      return;
    }

    removeFromArr(GlobalVars.openSet, curr); // usuwamy sprawdzony juz element z openset
    GlobalVars.closedSet.push(curr); // dodajemy do sprawdzonych
    //console.log("TUTAJ")

    for (let neighbor of curr.neighbors) {//sprawdzamy wszystkich sasiadow
      if (!GlobalVars.closedSet.includes(neighbor) && neighbor.isEmpty) {// jezeli nie ma sasiada w closedSet lub sasiad nie jest sciana
        let tempG = curr.g + 1;
        //console.log("TUTAJ sasiedzi")
        let betterPath = false;
        if (GlobalVars.openSet.includes(neighbor)) {//jezeli openSet zawiera sasiada
          if (tempG < neighbor.g) { // czy nasz tymczasowy Gscore 
            neighbor.g = tempG;
            betterPath = true;
          }
        } else {
          neighbor.g = tempG;
          betterPath = true;
          GlobalVars.openSet.push(neighbor);
        }

        if (betterPath && GlobalVars.endNode) {
          neighbor.h = heuristic(neighbor, GlobalVars.endNode); //odleglosc xd
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.prev = curr;
        }
      }
    }

  } else {

    GlobalVars.cantFind = true;
    return;
  }



  //make path
  GlobalVars.path = [];
  let temp = curr;
  GlobalVars.path.push(temp);
  //console.log("TUTAJ makepath")
  while (temp.prev) {
    GlobalVars.path.push(temp.prev);
    temp = temp.prev;
  }


}


function removeFromArr(arr: Pole[], element: Pole | null) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == element) {
      arr.splice(i, 1);
    }
  }
}

function heuristic(a: { i: number, j: number }, b: Pole) { // tw pitagorasa pewnie lepiej jest uzyc manhatan distance
  let distance = Math.abs(b.i - a.i) + Math.abs(b.j - a.j)
  return distance * 1.0 //* (1 + 1 / 10000);//distance * lowest cost czyli tutaj 1
}

function swapBall(from: Pole, target: Pole) {
  if (from.ball)
    target.addBall(from.ball.color);
  from.deleteBall();

  //console.log(target, from);
}


