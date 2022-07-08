import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS }    from '@angular/common/http';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { MomentModule } from 'angular2-moment'; 

import { AppComponent } from './app.component';
import { MultipleAccountsComponent } from './multiple-accounts/multiple-accounts.component';
import { AggregationManagementComponent} from './aggregation-management/aggregation-management.component';
import { ChangeSourceOwnerComponent} from './change-source-owner/change-source-owner.component';
import { AggregateSourceComponent} from './aggregate-source/aggregate-source.component';
import { ResetSourceComponent} from './source-reset/source-reset.component';
import { ImportRuleComponent} from './connector-rule-management/connector-rule-management.component';
import { CloudRuleComponent} from './cloud-rule-management/cloud-rule-management.component';
import { ChangeRoleOwnerComponent} from './change-role-owner/change-role-owner.component';
import { ChangeAccessProfileOwnerComponent} from './change-ap-owner/change-ap-owner.component';
import { RoleManagementComponent} from './role-management/role-management.component';
import { AccessProfileManagementComponent} from './ap-management/ap-management.component';
import { ReleaseHistoryComponent } from './release-history/release-history.component';
import { CreditsComponent } from './credits/credits.component';
import { OrgTimeComponent } from './org-time/org-time.component';
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
    ImportRuleComponent,
    CloudRuleComponent,
    ChangeRoleOwnerComponent,
    ChangeAccessProfileOwnerComponent,
    RoleManagementComponent,
    AccessProfileManagementComponent,
    ReleaseHistoryComponent,
    CreditsComponent,
    OrgTimeComponent,
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
