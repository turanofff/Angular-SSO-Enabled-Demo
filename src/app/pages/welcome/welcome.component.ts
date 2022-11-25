import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AccountService } from 'src/app/shared/account.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

  public account$: Observable<string>;

  constructor(
    private accountService: AccountService,
  ) { 
    this.account$ = this.accountService.account$
  }

}
