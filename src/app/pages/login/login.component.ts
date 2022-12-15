import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, Subject, take, takeUntil, timeout } from 'rxjs';
import { AccountService } from 'src/app/shared/account.service';
import { SSOService } from 'src/app/shared/sso.service';
import { parseJWTpayload } from 'src/app/shared/security';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  private onDestroySubj = new Subject<void>();
  public errorBanner = false;
  public errorText = '';
  public loginWithRedirect = false;


  constructor(
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private ssoService: SSOService,
  ) { }

  ngOnInit(): void {
    this.ssoService.handleRedirectCallback(this.route).pipe(
      takeUntil(this.onDestroySubj),
      take(1),
      catchError(()=> {
          this.errorBanner = true;
          this.errorText = 'Unable to sign in with google account';
          return EMPTY;
    })).subscribe((response) => {
      // Handle successful login here
      const accountObject = parseJWTpayload(response.access_token);
      this.doLogin(accountObject?.custom?.email);
    });
  }

  ngOnDestroy() {
    this.onDestroySubj.next();
    this.onDestroySubj.complete();
  }


  /** A call that mocks the successful login process */
  private doLogin(username: string): void {
    console.log('attempting login')
    this.ssoService.resetStates();
    this.accountService.saveUsername(username);
    this.router.navigate(['/welcome'])
  }

  /** Starts authentication session using SSO */
  public async loginWithSSO() {
    if (this.loginWithRedirect) {
      this.ssoService.loginWithRedirect();
    } else {
      this.ssoService.loginWithPopup().pipe(
        timeout(3*60*1000), // Give it 3 minutes to complete
        take(1),
        catchError(() => {
          this.errorBanner = true;
          this.errorText = 'Unable to sign in with google account';
          return EMPTY;
        })
      ).subscribe((response: any) => {
        const accountObject = parseJWTpayload(response.access_token);
        this.doLogin(accountObject?.custom?.email);
      });
    }
  }
}
