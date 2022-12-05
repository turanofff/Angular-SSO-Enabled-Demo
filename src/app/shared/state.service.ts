import { Injectable } from '@angular/core';
import { createRandomString, sha256, urlEncodeB64 } from 'src/app/shared/utils';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  getCrypto() {
    return window.crypto;
  } 

  public resetStates(): void {
    localStorage.removeItem('saml_state');
    localStorage.removeItem('saml_verifier');
  }

  public getState(is: 'new' | 'saved'): string | null {
    if (is === 'new'){
      const state = createRandomString();
      localStorage.setItem('saml_state', state);
      return state;
    } else {
      return localStorage.getItem('saml_state');
    }
  }

  public async getChallenge(is: 'new' | 'saved'): Promise<string | null> {
    if (is === 'new'){ 
      const code_verifier = createRandomString();
      localStorage.setItem('saml_verifier', code_verifier);
      const code_challenge = await sha256(code_verifier);
      // Some characters in Base64 are not URL safe so we need to encode them
      // i.e. [+] becomes [-] then [/] becomes [_] and finally [=] becomes [.]
      return urlEncodeB64(code_challenge);
    } else {
      return localStorage.getItem('saml_verifier');
    }
  }
}
