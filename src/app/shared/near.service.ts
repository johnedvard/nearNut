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
  CONTRACT_NAME_TESTNET = 'nearnut.testnet';
  CONTRACT_NAME_MAINNET = 'nearnut.near';
  APP_KEY_PREFIX = 'near-nut:';
  private near: Near;
  private readAccount: Account;
  private accountSubject: BehaviorSubject<Account> =
    new BehaviorSubject<Account>(null);
  private contract: Contract;
  private walletConnection: WalletConnection;
  private balance: AccountBalance;
  private nftTokensBySeriesCache: { [series_id: string]: any } = {};
  private nftTokensforOwnerCache: { [account_id: string]: any } = {};

  constructor() {
    this.initNear().then(async ({ near, walletConnection }) => {
      if (walletConnection) {
        this.readAccount = new Account(near.connection, this.getContractName());
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
        this.contract = await new Contract(account, this.getContractName(), {
          // View methods are read only. They don't modify the state, but usually return some value.
          viewMethods: ['getLevel', 'getLevels'],
          // Change methods can modify the state. But you don't receive the returned value when called.
          changeMethods: [
            'clearLevel',
            'nft_tokens_for_owner',
            'nft_tokens_by_series',
          ],
        });
        this.accountSubject.next(account);
      }
    });
  }

  getNftTokensForOwner(account_id: string): Promise<any> {
    const args = { account_id };
    if (this.nftTokensforOwnerCache[account_id]) {
      return Promise.resolve(this.nftTokensforOwnerCache[account_id]);
    }
    return (<any>this.contract).nft_tokens_for_owner(args).then((res: any) => {
      console.log('nft_tokens_for_owner', res);
    });
  }
  getNftTokensBySeries(token_series_id: string): Promise<any[]> {
    if (!this.walletConnection.isSignedIn()) {
      return Promise.reject('Not signed in');
    }
    if (this.nftTokensBySeriesCache[token_series_id]) {
      return Promise.resolve(this.nftTokensBySeriesCache[token_series_id]);
    }
    const args = { token_series_id };
    return (<any>this.contract).nft_tokens_by_series(args).then((res: any) => {
      this.nftTokensBySeriesCache[token_series_id] = res;
      console.log('nft_tokens_by_series', res);
      return res;
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
    console.log('click login');
    // TODO (johnedvard) get env variable instead of hardcode development
    if (!this.walletConnection || !this.near) return;
    if (!this.walletConnection.isSignedIn()) {
      // Need to pass the correct contract name to be able to call change methods on behalf of the user without requesting permission
      this.walletConnection.requestSignIn(this.getContractName());
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
    const env = environment.mainnet ? 'mainnet' : 'testnet';
    const nearConfig = getNearConfig(env, this.APP_KEY_PREFIX);
    if (!this.near) {
      this.near = await connect(nearConfig);
      this.walletConnection = new WalletConnection(
        this.near,
        this.APP_KEY_PREFIX
      );
    }
    return { near: this.near, walletConnection: this.walletConnection };
  }

  private getContractName() {
    return environment.mainnet
      ? this.CONTRACT_NAME_MAINNET
      : this.CONTRACT_NAME_TESTNET;
  }
}
