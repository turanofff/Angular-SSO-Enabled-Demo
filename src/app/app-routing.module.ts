import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { SamlDiagramComponent } from 'src/app/pages/saml-diagram/saml-diagram.component';
import { WelcomeComponent } from 'src/app/pages/welcome/welcome.component';
import { AuthGuard } from 'src/app/shared/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'welcome', component: WelcomeComponent, canActivate: [AuthGuard]},
  { path: 'saml-diagram', component: SamlDiagramComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
