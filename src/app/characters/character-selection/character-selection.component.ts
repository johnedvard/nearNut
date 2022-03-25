import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Account } from 'near-api-js';
import { first } from 'rxjs';
import { NearService } from 'src/app/shared/near.service';
import { NFT_SERIES_MIRROR_CRYSTALS } from 'src/app/shared/nearUtil';

@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrls: ['./character-selection.component.sass'],
})
export class CharacterSelectionComponent implements OnInit {
  DEFAULT_HERO_ID = 'heroDefault';
  // TODO (johnedvard) read from localstorage (or contract) to get last selected ID.
  selectedCandidateId = this.DEFAULT_HERO_ID; // Candidate
  currentCharId = this.DEFAULT_HERO_ID; // Currently selected character,
  characters = [
    {
      id: this.DEFAULT_HERO_ID,
      imgSrc:
        'assets/platform_metroidvania/herochar sprites(new)/herochar_jump_up_anim.gif',
      isOwned: true,
      name: 'Near Nut',
    },
    {
      id: NFT_SERIES_MIRROR_CRYSTALS,
      imgSrc: 'assets/mirror_crystals/MirrorCrystalsHero16x16.png',
      isOwned: false,
      name: 'Mirror Crystal Hero',
    },
  ];
  account: Account;

  constructor(private nearService: NearService, private snackBar: MatSnackBar) {
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
      this.selectedCandidateId = character.id;
    } else {
      const toast = this.snackBar.open('Not owned', 'Buy NFT from Paras', {
        duration: 3000,
      });
      toast
        .onAction()
        .pipe(first())
        .subscribe(() => {
          window.open(
            `https://paras.id/token/x.paras.near::${character.id}`,
            'new'
          );
        });
    }
  }
  confirmSelection() {
    this.currentCharId = this.selectedCandidateId;
    // TODO (johnedvard) store to local storage (or contract)
  }

  private getNftCharacters() {
    this.characters.forEach((c) => {
      if (c.id === this.DEFAULT_HERO_ID) return;
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
