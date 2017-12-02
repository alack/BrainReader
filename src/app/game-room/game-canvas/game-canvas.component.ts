import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {GameIoService} from '../game-io.service';

@Component({
  selector: 'app-game-canvas',
  templateUrl: './game-canvas.component.html',
  styleUrls: ['./game-canvas.component.css']
})



export class GameCanvasComponent implements OnInit, OnDestroy {
  @ViewChild('cv') c;
  // socket;
  ctx;
  click;
  roomId = 1;
  con_startPath;
  con_movePath;
  con_finishPath;
  constructor(private gameIo: GameIoService ) {}

  ngOnInit() {
    this.c  = document.getElementById('cv');
    this.c.width = 560;
    this.c.height = 450;
    this.ctx = this.c.getContext('2d');
    this.click = false;
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
  }

  ngOnDestroy() {
    this.con_startPath.unsubscribe();
    this.con_movePath.unsubscribe();
    this.con_finishPath.unsubscribe();
  }

  startPath(e) {
    const ev = this.getSangDaeMousePos(e);
    this.ctx.beginPath();
    this.click = true;
    console.log('x', ev.x, ' y', ev.y, ' 마우스 클릭');
  }

  movePath(e) {
    const ev = this.getSangDaeMousePos(e);
    this.ctx.lineTo(ev.x, ev.y);
    this.ctx.stroke();
    console.log('x', ev.x, ' y', ev.y, ' 마우스 움직임');
  }

  finishPath(e) {
    const ev = this.getSangDaeMousePos(e);
    this.ctx.lineTo(ev.x, ev.y);
    this.ctx.stroke();
    this.ctx.closePath();
    this.click = false;
    console.log('x', ev.x, ' y', ev.y, ' 마우스 떼기');
  }

  mouseDown(e: MouseEvent) {
    const abPos = this.getAbsoluteMousePos(e);
    this.gameIo.sendStartLine(abPos);
  }

  mouseMove(e: MouseEvent) {
    if (this.click) {
      const abPos = this.getAbsoluteMousePos(e);
      this.gameIo.sendMoveLine(abPos);
    }
  }

  mouseUp(e: MouseEvent) {
    const abPos = this.getAbsoluteMousePos(e);
    this.gameIo.sendFinishLine(abPos);
  }

  getSangDaeMousePos(e) {
    e.x = Math.round(e.x * this.c.width);
    e.y = Math.round(e.y * this.c.height);
    return e;
  }

  getAbsoluteMousePos(e) {
    const rect = this.c.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / (rect.right - rect.left),
      y: (e.clientY - rect.top) / (rect.bottom - rect.top)
    };
  }

  injectColor(color: string) {
    this.ctx.lineWidth = (color === 'white') ? 5 : 1;
    this.ctx.strokeStyle = color;
  }

  gameStart() {
    this.con_startPath = this.gameIo.getStartPath().subscribe(data => {
      this.startPath(data);
    });
    this.con_movePath = this.gameIo.getMovePath().subscribe( data => {
      this.movePath(data);
    });
    this.con_finishPath = this.gameIo.getFinishPath().subscribe( data => {
      this.finishPath(data);
    });

  }

}
