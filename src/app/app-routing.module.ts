// Core imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Application imports
import { AccountSearchComponent } from './account-search/account-search.component';
import { MultipleAccountsComponent } from './multiple-accounts-report/multiple-accounts-report.component';
import { AccessRequestStatusComponent } from './access-request-status/access-request-status.component';
import { AccessRequestApprovalForwardComponent } from './access-request-approval-forward/access-request-approval-forward.component';
import { WorkItemsStatusComponent } from './work-items-status/work-items-status.component';
import { WorkItemsForwardComponent } from './work-items-forward/work-items-forward.component';
import { EntitlementManagementComponent } from './misc-entitlement-management/misc-entitlement-management.component';
import { AggregationManagementComponent } from './source-aggregation-management/source-aggregation-management.component';
import { ChangeSourceOwnerComponent } from './source-owner-update/source-owner-update.component';
import { AggregateSourceComponent } from './source-aggregation-run/source-aggregation-run.component';
import { SourceCreateProfileComponent } from './source-create-profile/source-create-profile.component';
import { ResetSourceComponent } from './source-reset/source-reset.component';
import { SourceInfoComponent } from './source-info/source-info.component';
import { ImportRuleComponent } from './rule-connector-management/rule-connector-management.component';
import { CloudRuleComponent } from './rule-cloud-management/rule-cloud-management.component';
import { ChangeRoleOwnerComponent } from './role-owner-update/role-owner-update.component';
import { DuplicateRoleComponent } from './role-duplicate/role-duplicate.component';
import { ChangeAccessProfileOwnerComponent } from './accessprofile-owner-update/accessprofile-owner-update.component';
import { RoleManagementComponent } from './role-management/role-management.component';
import { AccessProfileManagementComponent } from './accessprofile-management/accessprofile-management.component';
import { IdentityProfileManagementComponent } from './identity-profile-management/identity-profile-management.component';
import { IdentityAttributeIndexComponent } from './identity-attribute-index/identity-attribute-index.component';
import { IdentityTransformManagementComponent } from './identity-transform-management/identity-transform-management.component';
import { IdentityLCSComponent } from './identity-lcs-management/identity-lcs-management.component';
import { IdentityInfoComponent } from './identity-info/identity-info.component';
import { IdentityAdminManagementComponent } from './identity-admin-management/identity-admin-management.component';
import { ReleaseHistoryComponent } from './release-history/release-history.component';
import { CreditsComponent } from './credits/credits.component';
import { OrgTimeComponent } from './misc-org-time-update/misc-org-time-update.component';
import { ManagePATComponent } from './misc-manage-pat/misc-manage-pat.component';
import { OrgStatsComponent } from './misc-org-stats/misc-org-stats.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './helper/auth.guard';
import { ReassignmentsComponent } from './reassignments/reassignments.component';
import { IdentityCompareComponent } from './identity-compare/identity-compare.component';
import { SystemMonitorComponent } from './system-monitor/system-monitor.component';
import { SystemMonitorSourceComponent } from './system-monitor-source/system-monitor-source.component';
import { AccountReportComponent } from './account-report/account-report.component';
import { RoleContainsEntComponent } from './role-contains-ent/role-contains-ent.component';
import { ReportFailuresComponent } from './report-failures/report-failures.component';
import { ReportTaskStatusComponent } from './report-task-status/report-task-status.component';

const routes: Routes = [
  { path: '', redirectTo: '/identity-info', pathMatch: 'full' },
  {
    path: 'multiple-accounts-report',
    component: MultipleAccountsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-search',
    component: AccountSearchComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-report',
    component: AccountReportComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'report-failures',
    component: ReportFailuresComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'report-task-status',
    component: ReportTaskStatusComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'role-contains-ent',
    component: RoleContainsEntComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'access-request-status',
    component: AccessRequestStatusComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'access-request-approval-forward',
    component: AccessRequestApprovalForwardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'work-items-status',
    component: WorkItemsStatusComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'work-items-forward',
    component: WorkItemsForwardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'entitlement-management',
    component: EntitlementManagementComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'source-aggregation-management',
    component: AggregationManagementComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'source-owner-update',
    component: ChangeSourceOwnerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'source-aggregation-run',
    component: AggregateSourceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'source-create-profile',
    component: SourceCreateProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'source-reset',
    component: ResetSourceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'system-monitor',
    component: SystemMonitorComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'system-monitor-source',
    component: SystemMonitorSourceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'source-info',
    component: SourceInfoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'rule-connector-management',
    component: ImportRuleComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'rule-cloud-management',
    component: CloudRuleComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'role-owner-update',
    component: ChangeRoleOwnerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'role-duplicate',
    component: DuplicateRoleComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'accessprofile-owner-update',
    component: ChangeAccessProfileOwnerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'role-management',
    component: RoleManagementComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'accessprofile-management',
    component: AccessProfileManagementComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'identity-profile-management',
    component: IdentityProfileManagementComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'identity-attribute-index',
    component: IdentityAttributeIndexComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'identity-transform-management',
    component: IdentityTransformManagementComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'identity-lcs-management',
    component: IdentityLCSComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'identity-compare',
    component: IdentityCompareComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'identity-info',
    component: IdentityInfoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'identity-admin-management',
    component: IdentityAdminManagementComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'release-history',
    component: ReleaseHistoryComponent,
    canActivate: [AuthGuard],
  },
  { path: 'credits', component: CreditsComponent, canActivate: [AuthGuard] },
  {
    path: 'misc-org-time-update',
    component: OrgTimeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'misc-manage-pat',
    component: ManagePATComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'reassignments',
    component: ReassignmentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'misc-org-stats',
    component: OrgStatsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
