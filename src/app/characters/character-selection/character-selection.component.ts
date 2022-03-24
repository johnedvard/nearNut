import { Component, OnInit } from '@angular/core';
import { NearService } from 'src/app/shared/near.service';
import { NFT_SERIES_MIRROR_CRYSTALS } from 'src/app/shared/nearUtil';

@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrls: ['./character-selection.component.sass'],
})
export class CharacterSelectionComponent implements OnInit {
  constructor(private nearService: NearService) {
    this.nearService
      .getNftTokensBySeries(NFT_SERIES_MIRROR_CRYSTALS)
      .then(() => {
        // TODO check if current user owns any on the series
      });
  }

  ngOnInit(): void {}
}
