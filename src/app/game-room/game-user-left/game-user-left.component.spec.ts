import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameUserLeftComponent } from './game-user-left.component';

describe('GameUserLeftComponent', () => {
  let component: GameUserLeftComponent;
  let fixture: ComponentFixture<GameUserLeftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameUserLeftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameUserLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
