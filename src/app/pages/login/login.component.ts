import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AccountService } from 'src/app/shared/account.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  private boundMessageHandler: any;
  constructor(
    private accountService: AccountService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) { 
    this.boundMessageHandler = this.receiveMessage.bind(this);
  }

  private onDestroySubj = new Subject<void>();
  public errorBanner = false;
  public errorText = '';
  public ssoLoginEnabled = false;

  public loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
    password: ['', Validators.required],
  })

  ngOnInit(): void {
    this.handleQueryParamBasedLogin();
  }

  ngOnDestroy() {
    this.onDestroySubj.next();
    this.onDestroySubj.complete();
  }

  /** For parsing JWT payload */
  private parseJWT(access_token: string): any {
    const jwtPayload = access_token.split('.')[1];
    return JSON.parse(decodeURIComponent(atob(jwtPayload)));
  }

  /** For performing login if query params contain access_token */
  private handleQueryParamBasedLogin() {
    // get the params from the url
    const access_token = this.route.snapshot.queryParamMap.get('access_token');

    if (access_token) {
      const accountObject = this.parseJWT(access_token);
      this.doLogin(accountObject?.custom?.email);
    }
  }

  /** Creates popup window with authorization request to the backend */
  private openPopup(): Window | null {
    const width = 400;
    const height = 600;
    const top = Math.round(window.innerHeight / 2 - height / 2);
    const left = Math.round(window.innerWidth / 2 - width / 2);
  
    return window.open(
      environment.ssoEndpoint,
      '_blank',
      `left=${left},top=${top},width=${width},height=${height},resizable,scrollbars=yes,status=1`
    );
  }

  /** Event handler to receive message with access_token from popup */
  private receiveMessage(event:any): void {
    const access_token = event?.data?.access_token;
    if(access_token) {
      const accountObject = this.parseJWT(access_token);
      this.doLogin(accountObject?.custom?.email);
    } else {
      this.errorBanner = true;
      this.errorText = 'Unable to sign in with google account';
    }
    window.removeEventListener('message', this.receiveMessage);
  }

  /** A call that mocks the successful login process */
  private doLogin(username: string): void {
    this.accountService.saveUsername(username);
    this.router.navigate(['/welcome'])
  }

  /** Starts authentication session using SSO */
  private loginWithSSO(redirect?: boolean): void {
    if (redirect) {
      window.location.assign(environment.ssoEndpoint);
    } else {
      window.removeEventListener('message', this.boundMessageHandler);
      this.openPopup();
      window.addEventListener('message', this.boundMessageHandler);
    }
  }

  /** Mocks a login with password process */
  private loginWithPassword(): void {
    if (this.loginForm.get('email')?.value !== environment.regularUser) {
      this.errorBanner = true;
      this.errorText = 'Invalid email / password';
    } else {
      this.doLogin(this.loginForm.get('email')?.value);
    }
  }
  
  /** Handles form submit action */
  public loginFormSubmit(): void {
    if (this.loginForm.get('email')?.valid) {
      this.loginWithPassword();
    } else {
      this.errorBanner = true;
      this.errorText = 'Malformed email address.';
    }
  }

  /** Handles SSO login action */
  public loginAdminAccount() {
    const emailFormControl = this.loginForm.get('email');
    if(emailFormControl && emailFormControl.valid && emailFormControl.value === environment.adminUser) {
      const loginWithRedirect = true;
      this.loginWithSSO(loginWithRedirect);
    }
  }
}
