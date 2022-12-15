import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { createRandomString, sha256hash, urlEncodeBase64 } from 'src/app/shared/security';
import { catchError, EMPTY, Observable, Subject, Subscription, take, tap, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Token } from 'src/app/shared/token.model';

@Injectable({
  providedIn: 'root'
})

/**
 * This service is intended to be used for Single Sign On authentication purposes.
 * 
 * It pretty much complies with OAuth2 protocol and implements PKCE mechanism for
 * secure token exchange between the front-end and the back-end. 
 * 
 * Currently this service is only supporting login with redirect and is able to
 * handle a redirect from the backend or identity provider with auth_code and state.
 */

export class SSOService {

  private boundMessageHandler: any;

  private messageSubj: Subject<Token> = new Subject<Token>();

  constructor(private http: HttpClient) { 
    this.boundMessageHandler = this.receiveMessage.bind(this);
  }

/**
   * For clearing state and code verifier stored locally.
   */
public resetStates(): void {
  localStorage.removeItem('saml_state');
  localStorage.removeItem('saml_verifier');
}

/**
 * Creates and stores a random string for state to prevent CSRF attacks.
 *
 * @returns random string.
 */
public createState(): string {
  const state = createRandomString();
  localStorage.setItem('saml_state', state);
  return state;
}

/**
 * Creates code challenge and code verifier and stores code verifier.
 *
 * @returns code challenge that needs to be sent to the backend.
 */
public async createChallenge(): Promise<string> {
  const code_verifier = createRandomString();
  localStorage.setItem('saml_verifier', code_verifier);
  const code_challenge = await sha256hash(code_verifier);
  // Some characters in Base64 are not URL safe so we need to replace them with the safe ones
  // i.e.: "+" becomes "-" then "/" becomes "_" and finally padding "=" is removed from the end
  return urlEncodeBase64(code_challenge);
}

/**
 * Initiates SSO login with redirect to IDP sign-on page.
 */
public loginWithRedirect(): void {
  const state = this.createState();
  this.createChallenge().then((challenge_code) => {
    window.location.assign(`${environment.ssoLoginEndpoint}?state=${state}&challenge_code=${challenge_code}`);
  });
}

/**
 * For handling redirects from IDP with auth_code. Designed to be used in OnInit lifecycle hook
 * for handling exchange of auth_code for bearer token automatically when required parameters 
 * are present in URL. 
 *
 * @param route - takes ActivatedRoute from component
 * @returns Observable with token if obtained successfully, otherwise returns an empty observable. 
 */
public handleRedirectCallback(route: ActivatedRoute): Observable<Token> {
  const state = route.snapshot.queryParamMap.get('state');
  const auth_code = route.snapshot.queryParamMap.get('auth_code');
  if (state && auth_code) {
    return this.getToken(state, auth_code);
  } 
  return EMPTY;
}

  public loginWithPopup(): Observable<Token> {
    window.removeEventListener('message', this.boundMessageHandler);
    this.openPopup();
    window.addEventListener('message', this.boundMessageHandler);
    return this.messageSubj.asObservable();
  }

  /** Creates popup window with authorization request to the backend */
  private openPopup(): void {
    const width = 400;
    const height = 600;
    const top = Math.round(window.innerHeight / 2 - height / 2);
    const left = Math.round(window.innerWidth / 2 - width / 2);

    const state = this.createState();
    this.createChallenge().then((challenge_code) => {
      window.open(`${environment.ssoLoginEndpoint}?state=${state}&challenge_code=${challenge_code}`,
        '_blank',
        `left=${left},top=${top},width=${width},height=${height},resizable,scrollbars=yes,status=1`
       );
    })
  }

  /** 
   * Event handler to receive message with access_token from popup 
   */
  private receiveMessage(event:any): void {
    window.removeEventListener('message', this.receiveMessage);

    const state = event?.data?.state;
    const auth_code = event?.data?.auth_code;

    if (state && auth_code) {
      this.getToken(state, auth_code).pipe(
          take(1),
          catchError(() => {
            this.messageSubj.complete();
            return EMPTY;
          }),
          tap((token: Token) => this.messageSubj.next(token))
        ).subscribe();
    } else {
      this.messageSubj.complete();
    }
  }
  /**
 * Requests bearer token from the backend providing that all the security criteria are met.
 *
 * @param state - requires state to validate authenticity of the request token call.
 * @param auth_code - single use code that is used to exchange for bearer token.
 * @returns Observable with token if obtained successfully, otherwise throws an error. 
 */
public getToken(state: string, auth_code: string): Observable<Token> {
  const savedState = localStorage.getItem('saml_state');
  const code_verifier = localStorage.getItem('saml_verifier');
  // Checks if all the required parameters are present. Additionally, checks that
  // the state is matching the one generated at the beginning of the sign on sequence
  // in order to prevent CSRF attacks.
  if (state && auth_code && code_verifier && savedState && savedState === state) {
    return this.http.post<Token>(`${environment.ssoTokenEndpoint}`, {
      auth_code,
      code_verifier
    });
  } 
  return throwError(() => new Error('Could not exchange auth_code for token'));
}
}
