import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Account } from 'near-api-js';
import { first } from 'rxjs';
import { NearService } from 'src/app/shared/near.service';
import { getMirrorCrystalSeries } from 'src/app/shared/nearUtil';
import { ICharacter } from '../i-character';

@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrls: ['./character-selection.component.sass'],
})
export class CharacterSelectionComponent implements OnInit {
  DEFAULT_HERO_ID = 'heroDefault';
  characters: ICharacter[] = [
    {
      id: this.DEFAULT_HERO_ID,
      imgSrc:
        'assets/platform_metroidvania/herochar sprites(new)/herochar_jump_up_anim.gif',
      isOwned: true,
      name: 'Near Nut',
      description: 'Our own Near Nustronaut, chopping his way through enemies',
    },
    {
      id: getMirrorCrystalSeries(),
      imgSrc: 'assets/mirror_crystals/MirrorCrystalsHero16x16.png',
      isOwned: false,
      name: 'Mirror Crystal Hero',
      description:
        'With the ability to portal himself, pass through enemies in a blink',
    },
  ];
  // TODO (johnedvard) read from localstorage (or contract) to get last selected ID.
  selectedCandidate = this.characters[0]; // Candidate
  currentCharId = this.DEFAULT_HERO_ID; // Currently selected character,
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
  selectCharacter(character: ICharacter) {
    this.selectedCandidate = character;
    if (!character.isOwned) {
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
    this.currentCharId = this.selectedCandidate.id;
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
