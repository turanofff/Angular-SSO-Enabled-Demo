import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accountSub = new BehaviorSubject<string>('');

  constructor(
    private http: HttpClient
  ) { }

  get account$ ():Observable<string> {
    return this.accountSub.asObservable();
  }

  public saveUsername (username: string): void {
    this.accountSub.next(username);
  }

  public isAuthenticated (): boolean {
    return this.accountSub.getValue().length > 0
  }

  public obtainToken(auth_code: string, code_verifier: string) {
    return this.http.post(environment.ssoTokenEndpoint, {
      auth_code,
      code_verifier
    })
  }
}
