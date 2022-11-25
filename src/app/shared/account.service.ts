import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accountSub = new BehaviorSubject<string>('');

  constructor() { }

  get account$ ():Observable<string> {
    return this.accountSub.asObservable();
  }

  public saveUsername (username: string): void {
    this.accountSub.next(username);
  }

  public isAuthenticated (): boolean {
    return this.accountSub.getValue().length > 0
  }
}
