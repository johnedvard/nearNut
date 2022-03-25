import { Component, OnInit } from '@angular/core';
import { Account } from 'near-api-js';
import { first, Subscription } from 'rxjs';
import { NearService } from 'src/app/shared/near.service';
import { NFT_SERIES_MIRROR_CRYSTALS } from 'src/app/shared/nearUtil';

@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrls: ['./character-selection.component.sass'],
})
export class CharacterSelectionComponent implements OnInit {
  // TODO (johnedvard) read from localstorage to get last selected ID.
  selectedCharId = 'heroDefault';
  extraCharacters = [
    {
      id: NFT_SERIES_MIRROR_CRYSTALS,
      imgSrc:
        'https://ipfs.fleek.co/ipfs/bafybeia6ieq7vbjgirsoocsanieejtkwjrsx6gubs4bcdosa5ly73layyy',
      isOwned: false,
    },
  ];
  account: Account;

  constructor(private nearService: NearService) {
    this.nearService
      .getAccount()
      .pipe(first())
      .subscribe((a) => {
        this.account = a;
        this.getNftCharacters();
      });
  }
  selectCharacter(character: { id: string; isOwned: boolean }) {
    if (character.isOwned) {
      this.selectedCharId = character.id;
    } else {
      console.log('Cannot select character not owned. Buy it from Paras');
    }
  }

  private getNftCharacters() {
    this.extraCharacters.forEach((c) => {
      // TODO (johnedvard) add pagination system
      this.nearService.getNftTokensBySeries(c.id).then((res) => {
        // Check if current user owns any tokens in the series
        res.find((r) => {
          if (r.owner_id === this.account.accountId) {
            c.isOwned = true;
          }
        });
      });
    });
  }

  ngOnInit(): void {}
}
