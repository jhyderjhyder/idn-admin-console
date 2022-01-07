import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DuplicatedAccountsComponent }   from './duplicated-accounts/duplicated-accounts.component';
import { AggregationManagementComponent }   from './aggregation-management/aggregation-management.component';
import { ChangeSourceOwnerComponent} from './change-source-owner/change-source-owner.component';
import { AggregateSourceComponent} from './aggregate-source/aggregate-source.component';
import { ImportRuleComponent} from './import-rule/import-rule.component';
import { LoginComponent }   from './login/login.component';
import { AuthGuard } from './helper/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/duplicate-account', pathMatch: 'full' },
  { path: 'duplicate-account', component: DuplicatedAccountsComponent, canActivate: [AuthGuard] },
  { path: 'manage-aggregation', component: AggregationManagementComponent, canActivate: [AuthGuard] },
  { path: 'change-source-owner', component: ChangeSourceOwnerComponent, canActivate: [AuthGuard] },
  { path: 'aggregate-source', component: AggregateSourceComponent, canActivate: [AuthGuard] },
  { path: 'import-rule', component: ImportRuleComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
