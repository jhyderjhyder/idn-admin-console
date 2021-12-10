import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DuplicatedAccountsComponent }   from './duplicated-accounts/duplicated-accounts.component';
import { LoginComponent }   from './login/login.component';
import { AuthGuard } from './helper/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/patient-search', pathMatch: 'full' },
  { path: 'patient-search', component: DuplicatedAccountsComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
