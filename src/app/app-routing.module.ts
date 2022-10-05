import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MultipleAccountsComponent }   from './multiple-accounts-report/multiple-accounts-report.component';
import { AggregationManagementComponent }   from './source-aggregation-management/source-aggregation-management.component';
import { ChangeSourceOwnerComponent} from './source-owner-update/source-owner-update.component';
import { AggregateSourceComponent} from './source-aggregation-run/source-aggregation-run.component';
import { ResetSourceComponent} from './source-reset/source-reset.component';
import { SourceInfoComponent} from './source-info/source-info.component';
import { ImportRuleComponent} from './rule-connector-management/rule-connector-management.component';
import { CloudRuleComponent} from './rule-cloud-management/rule-cloud-management.component';
import { ChangeRoleOwnerComponent} from './role-owner-update/role-owner-update.component';
import { ChangeAccessProfileOwnerComponent} from './accessprofile-owner-update/accessprofile-owner-update.component';
import { RoleManagementComponent} from './role-management/role-management.component';
import { AccessProfileManagementComponent} from './accessprofile-management/accessprofile-management.component';
import { IdentityProfileManagementComponent} from './identity-profile-management/identity-profile-management.component';
import { IdentityAttributeIndexComponent} from './identity-attribute-index/identity-attribute-index.component';
import { IdentityTransformManagementComponent} from './identity-transform-management/identity-transform-management.component';
import { ReleaseHistoryComponent} from './release-history/release-history.component';
import { CreditsComponent} from './credits/credits.component';
import { OrgTimeComponent} from './misc-org-time-update/misc-org-time-update.component';
import { ManagePATComponent } from './misc-manage-pat/misc-manage-pat.component';
import { OrgStatsComponent} from './misc-org-stats/misc-org-stats.component';
import { LoginComponent }   from './login/login.component';
import { AuthGuard } from './helper/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/multiple-accounts-report', pathMatch: 'full' },
  { path: 'multiple-accounts-report', component: MultipleAccountsComponent, canActivate: [AuthGuard] },
  { path: 'source-aggregation-management', component: AggregationManagementComponent, canActivate: [AuthGuard] },
  { path: 'source-owner-update', component: ChangeSourceOwnerComponent, canActivate: [AuthGuard] },
  { path: 'source-aggregation-run', component: AggregateSourceComponent, canActivate: [AuthGuard] },
  { path: 'source-reset', component: ResetSourceComponent, canActivate: [AuthGuard] },
  { path: 'source-info', component: SourceInfoComponent, canActivate: [AuthGuard] },
  { path: 'rule-connector-management', component: ImportRuleComponent, canActivate: [AuthGuard] },
  { path: 'rule-cloud-management', component: CloudRuleComponent, canActivate: [AuthGuard] },
  { path: 'role-owner-update', component: ChangeRoleOwnerComponent, canActivate: [AuthGuard] },
  { path: 'accessprofile-owner-update', component: ChangeAccessProfileOwnerComponent, canActivate: [AuthGuard] },
  { path: 'role-management', component: RoleManagementComponent, canActivate: [AuthGuard] },
  { path: 'accessprofile-management', component: AccessProfileManagementComponent, canActivate: [AuthGuard] },
  { path: 'identity-profile-management', component: IdentityProfileManagementComponent, canActivate: [AuthGuard] },
  { path: 'identity-attribute-index', component: IdentityAttributeIndexComponent, canActivate: [AuthGuard] },
  { path: 'identity-transform-management', component: IdentityTransformManagementComponent, canActivate: [AuthGuard] },
  { path: 'release-history', component: ReleaseHistoryComponent, canActivate: [AuthGuard] },
  { path: 'credits', component: CreditsComponent, canActivate: [AuthGuard] },
  { path: 'misc-org-time-update', component: OrgTimeComponent, canActivate: [AuthGuard] },
  { path: 'misc-manage-pat', component: ManagePATComponent, canActivate: [AuthGuard] },
  { path: 'misc-org-stats', component: OrgStatsComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
