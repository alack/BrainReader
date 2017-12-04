import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameUserRightComponent } from './game-user-right.component';

describe('GameUserRightComponent', () => {
  let component: GameUserRightComponent;
  let fixture: ComponentFixture<GameUserRightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameUserRightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameUserRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
