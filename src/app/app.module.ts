import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS }    from '@angular/common/http';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { MomentModule } from 'angular2-moment'; 

import { AppComponent } from './app.component';
import { MultipleAccountsComponent } from './multiple-accounts-report/multiple-accounts-report.component';
import { AggregationManagementComponent} from './source-aggregation-management/source-aggregation-management.component';
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
import { ReleaseHistoryComponent } from './release-history/release-history.component';
import { CreditsComponent } from './credits/credits.component';
import { OrgTimeComponent } from './misc-org-time-update/misc-org-time-update.component';
import { ManagePATComponent } from './misc-manage-pat/misc-manage-pat.component';
import { OrgStatsComponent } from './misc-org-stats/misc-org-stats.component';
import { AppRoutingModule } from './app-routing.module';
import { MessagesComponent } from './messages/messages.component';
import { SearchFilterPipe } from './shared/search-filter.pipe';

import { BasicAuthInterceptor } from './helper/basic-auth.interceptor';
import { ErrorInterceptor } from './helper/error.interceptor';
import { LoginComponent } from './login/login.component';
import { ModalModule } from "ngx-bootstrap/modal";
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    AppComponent,
    MultipleAccountsComponent,
    AggregationManagementComponent,
    ChangeSourceOwnerComponent,
    AggregateSourceComponent,
    ResetSourceComponent,
    SourceInfoComponent,
    ImportRuleComponent,
    CloudRuleComponent,
    ChangeRoleOwnerComponent,
    ChangeAccessProfileOwnerComponent,
    RoleManagementComponent,
    AccessProfileManagementComponent,
    IdentityProfileManagementComponent,
    IdentityAttributeIndexComponent,
    IdentityTransformManagementComponent,
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
    MomentModule,
    ModalModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
