import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MultipleAccountsComponent }   from './multiple-accounts/multiple-accounts.component';
import { AggregationManagementComponent }   from './aggregation-management/aggregation-management.component';
import { ChangeSourceOwnerComponent} from './change-source-owner/change-source-owner.component';
import { AggregateSourceComponent} from './aggregate-source/aggregate-source.component';
import { LoginComponent }   from './login/login.component';
import { AuthGuard } from './helper/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/multiple-account', pathMatch: 'full' },
  { path: 'multiple-account', component: MultipleAccountsComponent, canActivate: [AuthGuard] },
  { path: 'manage-aggregation', component: AggregationManagementComponent, canActivate: [AuthGuard] },
  { path: 'change-source-owner', component: ChangeSourceOwnerComponent, canActivate: [AuthGuard] },
  { path: 'aggregate-source', component: AggregateSourceComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
