import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { Account } from 'near-api-js';
import { NearService } from 'src/app/shared/near.service';

@Component({
  selector: 'app-login-menu',
  templateUrl: './login-menu.component.html',
  styleUrls: ['./login-menu.component.sass'],
})
export class LoginMenuComponent implements OnInit {
  isReady = false; // set to true when wallet connection has been made
  account: Account;

  @HostBinding('class.signed-in') isSignedIn: boolean = false;

  constructor(private nearService: NearService) {
    this.nearService.getAccount().subscribe((account) => {
      this.account = account;
      this.isReady = true;
      if (!this.nearService.isSignedIn()) {
        this.isSignedIn = false;
      } else {
        this.isSignedIn = true;
        this.nearService.getNftTokensForOwner(account.accountId);
      }
    });
  }

  ngOnInit(): void {}

  logout(event: MouseEvent) {
    this.nearService.logout();
    // prevent log-in-out component from automatically signing in
    event.preventDefault();
    event.stopPropagation();
  }

  login(event: MouseEvent) {
    if (!this.isReady) return;
    if (this.nearService.isSignedIn()) {
      event.stopPropagation();
    } else {
      this.nearService.login();
    }
  }
}
