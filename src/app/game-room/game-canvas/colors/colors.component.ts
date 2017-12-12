import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-colors',
  templateUrl: './colors.component.html',
  styleUrls: ['./colors.component.css']
})
export class ColorsComponent implements OnInit {
  @Input() width;
  @Output()  colorUpdated: EventEmitter<any> = new EventEmitter();
  colors;
  constructor() { }

  ngOnInit() {
    this.colors = [
      'red',
      'purple',
      'blue',
      'cyan',
      'yellow',
      'magenta',
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
