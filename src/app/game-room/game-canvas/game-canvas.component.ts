import {Component, OnInit, ViewChild} from '@angular/core';
// import io from 'socket.io-client';

@Component({
  selector: 'app-game-canvas',
  templateUrl: './game-canvas.component.html',
  styleUrls: ['./game-canvas.component.css']
})



export class GameCanvasComponent implements OnInit {
  @ViewChild('cv') c;
  // socket;
  ctx;
  click;
  constructor( ) {
  }

  ngOnInit() {
    // this.socket = io('http://localhost:4200');
    this.c  = document.getElementById('cv');
    this.c.width = 560;
    this.c.height = 450;
    this.ctx = this.c.getContext('2d');
    this.click = false;
    // this.socket.on('startpath', this.startPath);
    // this.socket.on('movepath', this.movePath);
    // this.socket.on('finishpath', this.finishPath);
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
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
    // this.socket.emit('startline', abPos);
    this.startPath(abPos);
  }

  mouseMove(e: MouseEvent) {
    if ( this.click ) {
      const abPos = this.getAbsoluteMousePos(e);
      // this.socket.emit('moveline', abPos);
      this.movePath(abPos);
    }
  }

  mouseUp(e: MouseEvent) {
    const abPos = this.getAbsoluteMousePos(e);
    // this.socket.emit('finishline', abPos);
    this.finishPath(abPos);
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

}
