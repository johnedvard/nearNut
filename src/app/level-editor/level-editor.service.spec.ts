import { TestBed } from '@angular/core/testing';

import { LevelEditorService } from './level-editor.service';

describe('LevelEditorService', () => {
  let service: LevelEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LevelEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
