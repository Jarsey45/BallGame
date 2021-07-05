import { position, GAME_WIDTH, hexColor } from './Globals';
// import { GlobalVars } from './main';
import p5 from 'p5';

export class Ball {
  private p: p5;
  private size: number;
  public pos: p5.Vector;
  public color: hexColor;


  constructor(p: p5, pos: position, color: hexColor, size?: number) {
    this.p = p;
    this.size = size ? size : this.p.width / 15;
    this.pos = p.createVector(pos.x + this.p.width / 120, pos.y + this.p.width / 120);
    this.color = color;
    //console.log('aaa')
  }

  show() {
    this.p.ellipseMode(this.p.CORNER);
    this.p.fill(this.color.r, this.color.g, this.color.b);
    this.p.ellipse(this.pos.x, this.pos.y, this.size);
  }

}
