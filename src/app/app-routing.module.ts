import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DuplicatedAccountsComponent }   from './duplicated-accounts/duplicated-accounts.component';
import { AggregationManagementComponent }   from './aggregation-management/aggregation-management.component';
import { LoginComponent }   from './login/login.component';
import { AuthGuard } from './helper/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/duplicate-account', pathMatch: 'full' },
  { path: 'duplicate-account', component: DuplicatedAccountsComponent, canActivate: [AuthGuard] },
  { path: 'manage-aggregation', component: AggregationManagementComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
