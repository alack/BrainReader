import { TestBed, inject } from '@angular/core/testing';

import { GameIoService } from './game-io.service';

describe('GameIoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameIoService]
    });
  });

  it('should be created', inject([GameIoService], (service: GameIoService) => {
    expect(service).toBeTruthy();
  }));
});
