import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

import { User } from './../model/user';
import { AuthenticationService } from '../service/authentication-service.service';

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: UntypedFormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      tenant: ['', Validators.required],
      domain: [''],
      clientId: ['', Validators.required],
      clientSecret: ['', Validators.required],
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    /*
        this.authenticationService.loginMock(this.f.username.value, this.f.password.value);
        this.loading = false;
        this.router.navigate([this.returnUrl]);
        */

    const user = new User();
    user.tenant = this.f.tenant.value;
    user.clientId = this.f.clientId.value;
    user.clientSecret = this.f.clientSecret.value;

    if (typeof this.f.domain.value != 'undefined' && this.f.domain.value) {
      user.domain = this.f.domain.value;
    } else {
      user.domain = 'identitynow.com';
    }

    this.authenticationService.authenticate(user).subscribe(
      response => {
        this.loading = true;
        const authUser = new User();
        authUser.clientId = user.clientId;
        authUser.tenant = user.tenant;
        authUser.domain = user.domain;
        if (response.body && response.body.access_token) {
          authUser.accessToken = response.body.access_token;
          this.authenticationService.checkOrgAdminAccess(authUser).subscribe(
            response => {
              this.loading = false;
              if (response.orgName) {
                this.authenticationService.afterLogin(authUser);
                this.router.navigate([this.returnUrl]);
              } else {
                console.log('error onSubmit');
                this.error =
                  '403 Forbidden: Given Client ID should have Org Admin Rights';
                this.loading = false;
              }
            },
            () => {
              console.log('error onSubmit');
              this.error =
                '403 Forbidden: Given Client ID should have Org Admin Rights';
              this.loading = false;
            }
          );
        } else {
          console.log('error onSubmit');
          this.error = 'Failed to authenticate.';
          this.loading = false;
        }
      },
      () => {
        console.log('error onSubmit');
        this.error = 'Failed to authenticate.';
        this.loading = false;
      }
    );
  }
}
