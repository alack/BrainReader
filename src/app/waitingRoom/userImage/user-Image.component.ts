import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from '../../service/session.service';

@Component({
  selector: 'app-user-image-update',
  templateUrl: './user-Image.component.html',
  styleUrls: ['./user-Image.component.css']
})
export class UserImageComponent implements OnInit {
  @Input() user;
   base64textString: string;

  constructor(private sessionService: SessionService) {
  }

  ngOnInit(): void {
    this.base64textString = this.user.image;
  }

  handleFileSelect(evt) {
    const files = evt.target.files;
    const file = files[0];

    if (files && file) {
      const reader = new FileReader();

      reader.onload = this._handleReaderLoaded.bind(this);

      reader.readAsBinaryString(file);
    }
  }

  _handleReaderLoaded(readerEvt) {
    const binaryString = readerEvt.target.result;
    this.base64textString = btoa(binaryString);
    this.user.image = 'data:image/jpeg;base64,' + this.base64textString;
    this.sessionService.setImage(this.user.image);
  }
}
