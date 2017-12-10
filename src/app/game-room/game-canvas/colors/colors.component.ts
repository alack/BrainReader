import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-colors',
  templateUrl: './colors.component.html',
  styleUrls: ['./colors.component.css']
})
export class ColorsComponent implements OnInit {
  @Output()  colorUpdated: EventEmitter<any> = new EventEmitter();
  colors;
  constructor() { }

  ngOnInit() {
    this.colors = [
      'yellow',
      'cyan',
      'blue',
      'magenta',
      'red',
      'green',
      'black',
      'grey',
      'white'
    ];
  }

  injectColor(colorname) {
    this.colorUpdated.emit(colorname);
  }
}
