// Core imports
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Third party imports
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';

// Application imports
import { AppComponent } from './app.component';
import { AccessProfileManagementComponent } from './accessprofile-management/accessprofile-management.component';
import { AccessRequestApprovalForwardComponent } from './access-request-approval-forward/access-request-approval-forward.component';
import { AccessRequestStatusComponent } from './access-request-status/access-request-status.component';
import { AggregateSourceComponent } from './source-aggregation-run/source-aggregation-run.component';
import { AggregationManagementComponent } from './source-aggregation-management/source-aggregation-management.component';
import { ChangeAccessProfileOwnerComponent } from './accessprofile-owner-update/accessprofile-owner-update.component';
import { ChangeRoleOwnerComponent } from './role-owner-update/role-owner-update.component';
import { CloudRuleComponent } from './rule-cloud-management/rule-cloud-management.component';
import { CreditsComponent } from './credits/credits.component';
import { DuplicateRoleComponent } from './role-duplicate/role-duplicate.component';
import { IdentityAttributeIndexComponent } from './identity-attribute-index/identity-attribute-index.component';
import { IdentityInfoComponent } from './identity-info/identity-info.component';
import { IdentityTransformManagementComponent } from './identity-transform-management/identity-transform-management.component';
import { IdentityProfileManagementComponent } from './identity-profile-management/identity-profile-management.component';
import { IdentityAdminManagementComponent } from './identity-admin-management/identity-admin-management.component';
import { ImportRuleComponent } from './rule-connector-management/rule-connector-management.component';
import { IdentityLCSComponent } from './identity-lcs-management/identity-lcs-management.component';
import { MultipleAccountsComponent } from './multiple-accounts-report/multiple-accounts-report.component';
import { WorkItemsStatusComponent } from './work-items-status/work-items-status.component';
import { WorkItemsForwardComponent } from './work-items-forward/work-items-forward.component';
import { EntitlementManagementComponent } from './misc-entitlement-management/misc-entitlement-management.component';
import { ResetSourceComponent } from './source-reset/source-reset.component';
import { ChangeSourceOwnerComponent } from './source-owner-update/source-owner-update.component';
import { SourceCreateProfileComponent } from './source-create-profile/source-create-profile.component';
import { SourceInfoComponent } from './source-info/source-info.component';
import { RoleManagementComponent } from './role-management/role-management.component';
import { ReleaseHistoryComponent } from './release-history/release-history.component';
import { OrgTimeComponent } from './misc-org-time-update/misc-org-time-update.component';
import { ManagePATComponent } from './misc-manage-pat/misc-manage-pat.component';
import { OrgStatsComponent } from './misc-org-stats/misc-org-stats.component';
import { MessagesComponent } from './messages/messages.component';
import { LoginComponent } from './login/login.component';

import { SearchFilterPipe } from './shared/search-filter.pipe';
import { ErrorInterceptor } from './helper/error.interceptor';
import { BasicAuthInterceptor } from './helper/basic-auth.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AccountSearchComponent } from './account-search/account-search.component';
import { ReassignmentsComponent } from './reassignments/reassignments.component';
import { IdentityCompareComponent } from './identity-compare/identity-compare.component';
import { SystemMonitorComponent } from './system-monitor/system-monitor.component';
import { SystemMonitorSourceComponent } from './system-monitor-source/system-monitor-source.component';
import { AccountReportComponent } from './account-report/account-report.component';
import { RoleContainsEntComponent } from './role-contains-ent/role-contains-ent.component';
import { ReportFailuresComponent } from './report-failures/report-failures.component';
import { ReportTaskStatusComponent } from './report-task-status/report-task-status.component';
import { RawObjectComponent } from './raw-object/raw-object.component';
import { FastTagComponent } from './fast-tag/fast-tag.component';
import { WorkflowsComponent } from './workflows/workflows.component';
import { ReportFailuresSourceComponent } from './report-failures-source/report-failures-source.component';
import { ReportAttributesyncEventsComponent } from './report-attributesync-events/report-attributesync-events.component';
import { ReportMostActiveComponent } from './report-most-active/report-most-active.component';
import { ReportApprovalHistoryComponent } from './report-approval-history/report-approval-history.component';
import { ReportInactiveIdentityWithActiveAccountsComponent } from './report-inactive-identity-with-active-accounts/report-inactive-identity-with-active-accounts.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    AppComponent,
    MultipleAccountsComponent,
    AccessRequestStatusComponent,
    AccessRequestApprovalForwardComponent,
    WorkItemsStatusComponent,
    WorkItemsForwardComponent,
    EntitlementManagementComponent,
    AggregationManagementComponent,
    ChangeSourceOwnerComponent,
    AggregateSourceComponent,
    SourceCreateProfileComponent,
    ResetSourceComponent,
    SourceInfoComponent,
    ImportRuleComponent,
    CloudRuleComponent,
    ChangeRoleOwnerComponent,
    DuplicateRoleComponent,
    ChangeAccessProfileOwnerComponent,
    RoleManagementComponent,
    AccessProfileManagementComponent,
    IdentityProfileManagementComponent,
    IdentityAdminManagementComponent,
    IdentityAttributeIndexComponent,
    IdentityTransformManagementComponent,
    IdentityLCSComponent,
    IdentityInfoComponent,
    ReleaseHistoryComponent,
    CreditsComponent,
    OrgTimeComponent,
    ManagePATComponent,
    OrgStatsComponent,
    MessagesComponent,
    LoginComponent,
    SearchFilterPipe,
    AccountSearchComponent,
    ReassignmentsComponent,
    IdentityCompareComponent,
    SystemMonitorComponent,
    SystemMonitorSourceComponent,
    AccountReportComponent,
    RoleContainsEntComponent,
    ReportFailuresComponent,
    ReportTaskStatusComponent,
    RawObjectComponent,
    FastTagComponent,
    WorkflowsComponent,
    ReportFailuresSourceComponent,
    ReportAttributesyncEventsComponent,
    ReportMostActiveComponent,
    ReportApprovalHistoryComponent,
    ReportInactiveIdentityWithActiveAccountsComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    NgSelectModule,
    AppRoutingModule,
    NgIdleKeepaliveModule.forRoot(),
    ModalModule.forRoot(),
    FontAwesomeModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
