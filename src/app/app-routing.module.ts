import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MultipleAccountsComponent }   from './multiple-accounts/multiple-accounts.component';
import { AggregationManagementComponent }   from './aggregation-management/aggregation-management.component';
import { ChangeSourceOwnerComponent} from './change-source-owner/change-source-owner.component';
import { AggregateSourceComponent} from './aggregate-source/aggregate-source.component';
import { ImportRuleComponent} from './rule-management/rule-management.component';
import { ChangeRoleOwnerComponent} from './change-role-owner/change-role-owner.component';
import { RoleManagementComponent} from './role-management/role-management.component';
import { ReleaseHistoryComponent} from './release-history/release-history.component';
import { CreditsComponent} from './credits/credits.component';
import { LoginComponent }   from './login/login.component';
import { AuthGuard } from './helper/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/multiple-account', pathMatch: 'full' },
  { path: 'multiple-account', component: MultipleAccountsComponent, canActivate: [AuthGuard] },
  { path: 'manage-aggregation', component: AggregationManagementComponent, canActivate: [AuthGuard] },
  { path: 'change-source-owner', component: ChangeSourceOwnerComponent, canActivate: [AuthGuard] },
  { path: 'aggregate-source', component: AggregateSourceComponent, canActivate: [AuthGuard] },
  { path: 'rule-management', component: ImportRuleComponent, canActivate: [AuthGuard] },
  { path: 'change-role-owner', component: ChangeRoleOwnerComponent, canActivate: [AuthGuard] },
  { path: 'role-management', component: RoleManagementComponent, canActivate: [AuthGuard] },
  { path: 'release-history', component: ReleaseHistoryComponent, canActivate: [AuthGuard] },
  { path: 'credits', component: CreditsComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
