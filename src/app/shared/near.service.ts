import { Injectable } from '@angular/core';
import {
  connect,
  ConnectConfig,
  Contract,
  keyStores,
  Near,
  WalletConnection,
} from 'near-api-js';
import { Account, AccountBalance } from 'near-api-js/lib/account';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { getNearConfig } from './nearConfig';

@Injectable({
  providedIn: 'root',
})
export class NearService {
  CONTRACT_NAME = 'x.paras.near';
  APP_KEY_PREFIX = 'near-nut:';
  private near: Near;
  private readAccount: Account;
  private accountSubject: BehaviorSubject<Account> =
    new BehaviorSubject<Account>(null);
  private contract: Contract;
  private walletConnection: WalletConnection;
  private balance: AccountBalance;

  constructor() {
    this.initNear().then(async ({ near, walletConnection }) => {
      if (walletConnection) {
        this.readAccount = new Account(near.connection, this.CONTRACT_NAME);
        let account = this.readAccount;
        if (walletConnection.isSignedIn()) {
          // loggied in user, has write priveledge
          account = walletConnection.account();
          account.getAccountBalance().then((balance: AccountBalance) => {
            this.balance = balance;
          });
        } else {
          // account with read priveledges only
          account = this.readAccount;
        }
        this.contract = await new Contract(account, this.CONTRACT_NAME, {
          // View methods are read only. They don't modify the state, but usually return some value.
          viewMethods: ['nft_tokens_for_owner', 'nft_tokens_by_series'],
          // Change methods can modify the state. But you don't receive the returned value when called.
          changeMethods: [''],
        });
        this.accountSubject.next(account);
      }
    });
  }

  getNftTokensForOwner(account_id: string): Promise<string> {
    const args = { account_id };
    return (<any>this.contract).nft_tokens_for_owner(args).then((res: any) => {
      console.log(res);
    });
  }
  getNftTokensBySeries(token_series_id: string): Promise<string> {
    const args = { token_series_id };
    return (<any>this.contract).nft_tokens_by_series(args).then((res: any) => {
      console.log(res);
    });
  }

  getBalance(): AccountBalance {
    return (
      this.balance || {
        total: '0',
        stateStaked: '0',
        staked: '0',
        available: '0',
      }
    );
  }

  getAccount(): Observable<Account> {
    return this.accountSubject.asObservable();
  }

  login() {
    // TODO (johnedvard) get env variable instead of hardcode development
    if (!this.walletConnection || !this.near) return;
    if (!this.walletConnection.isSignedIn()) {
      // Need to pass the correct contract name to be able to call change methods on behalf of the user without requesting permission
      this.walletConnection.requestSignIn(this.CONTRACT_NAME);
    }
  }

  logout() {
    if (!this.walletConnection) return;
    this.walletConnection.signOut();
    // User should still be able to read content
    this.accountSubject.next(this.readAccount);
  }

  isSignedIn(): boolean {
    if (this.walletConnection) {
      return this.walletConnection.isSignedIn();
    }
    return false;
  }

  private async initNear(): Promise<{
    near: Near;
    walletConnection: WalletConnection | null;
  }> {
    const nearConfig = getNearConfig('production', this.APP_KEY_PREFIX);
    if (!this.near) {
      this.near = await connect(nearConfig);
      this.walletConnection = new WalletConnection(
        this.near,
        this.APP_KEY_PREFIX
      );
    }
    return { near: this.near, walletConnection: this.walletConnection };
  }
}
