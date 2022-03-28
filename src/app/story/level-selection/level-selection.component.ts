import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IStoryLevelMetaData } from '../i-story-level-meta-data';

@Component({
  selector: 'app-level-selection',
  templateUrl: './level-selection.component.html',
  styleUrls: ['./level-selection.component.sass'],
})
export class LevelSelectionComponent implements OnInit {
  @Output() selectLevel = new EventEmitter<string>();

  levels: IStoryLevelMetaData[] = [
    {
      id: '005',
      name: '1-5',
      isCleared: false,
      isUnlocked: false,
      isMotizedContent: false,
    },
    {
      id: '006',
      name: '1-6',
      isCleared: false,
      isUnlocked: false,
      isMotizedContent: false,
    },
    {
      id: '007',
      name: '1-7',
      isCleared: false,
      isUnlocked: false,
      isMotizedContent: false,
    },
    {
      id: '008',
      name: '1-8',
      isCleared: false,
      isUnlocked: false,
      isMotizedContent: false,
    },
    {
      id: '001',
      name: '1-1',
      isCleared: true,
      isUnlocked: true,
      isMotizedContent: false,
    },
    {
      id: '002',
      name: '1-2',
      isCleared: false,
      isUnlocked: false,
      isMotizedContent: false,
    },
    {
      id: '003',
      name: '1-3',
      isCleared: false,
      isUnlocked: false,
      isMotizedContent: false,
    },
    {
      id: '004',
      name: '1-4',
      isCleared: false,
      isUnlocked: false,
      isMotizedContent: false,
    },
  ];
  constructor(private snackbar: MatSnackBar) {}

  ngOnInit(): void {}

  levelClick(event: MouseEvent, level: IStoryLevelMetaData) {
    if (!level.isUnlocked) {
      this.snackbar.open('Clear previous levels to unlock', '', {
        duration: 3000,
      });
      return;
    }
    this.selectLevel.emit(level.id);
  }
}
