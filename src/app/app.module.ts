// Core imports
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS }    from '@angular/common/http'; 

// Third party imports
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';


// Application imports
import { AppComponent } from './app.component';
import { AccessProfileManagementComponent} from './accessprofile-management/accessprofile-management.component';
import { AccessRequestApprovalForwardComponent } from './access-request-approval-forward/access-request-approval-forward.component';
import { AccessRequestStatusComponent } from './access-request-status/access-request-status.component';
import { AggregateSourceComponent} from './source-aggregation-run/source-aggregation-run.component';
import { AggregationManagementComponent} from './source-aggregation-management/source-aggregation-management.component';
import { ChangeAccessProfileOwnerComponent} from './accessprofile-owner-update/accessprofile-owner-update.component';
import { ChangeRoleOwnerComponent} from './role-owner-update/role-owner-update.component';
import { CloudRuleComponent} from './rule-cloud-management/rule-cloud-management.component';
import { CreditsComponent } from './credits/credits.component';
import { DuplicateRoleComponent } from './role-duplicate/role-duplicate.component';
import { IdentityAttributeIndexComponent} from './identity-attribute-index/identity-attribute-index.component';
import { IdentityInfoComponent} from './identity-info/identity-info.component';
import { IdentityTransformManagementComponent} from './identity-transform-management/identity-transform-management.component';
import { IdentityProfileManagementComponent} from './identity-profile-management/identity-profile-management.component';
import { ImportRuleComponent} from './rule-connector-management/rule-connector-management.component';
import { IdentityLCSComponent} from './identity-lcs-management/identity-lcs-management.component';
import { MultipleAccountsComponent } from './multiple-accounts-report/multiple-accounts-report.component';
import { WorkItemsStatusComponent } from './work-items-status/work-items-status.component';
import { WorkItemsForwardComponent } from './work-items-forward/work-items-forward.component';
import { ResetSourceComponent} from './source-reset/source-reset.component';
import { ChangeSourceOwnerComponent} from './source-owner-update/source-owner-update.component';
import { SourceCreateProfileComponent} from './source-create-profile/source-create-profile.component';
import { SourceInfoComponent} from './source-info/source-info.component';
import { RoleManagementComponent} from './role-management/role-management.component';
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


@NgModule({
  declarations: [
    AppComponent,
    MultipleAccountsComponent,
    AccessRequestStatusComponent,
    AccessRequestApprovalForwardComponent,
    WorkItemsStatusComponent,
    WorkItemsForwardComponent,
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
    SearchFilterPipe
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
   
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true } 

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
