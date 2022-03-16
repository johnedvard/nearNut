import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelToolbarComponent } from './level-toolbar.component';

describe('LevelToolbarComponent', () => {
  let component: LevelToolbarComponent;
  let fixture: ComponentFixture<LevelToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LevelToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
