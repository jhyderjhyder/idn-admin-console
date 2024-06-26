// Core imports
import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

// Third party imports
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';

// Application imports
import { MessageService } from './service/message.service';
import { AuthenticationService } from './service/authentication-service.service';
import { User } from './model/user';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Menu } from './app.menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'IDN Admin Console';
  currentUser: User;
  launchedFromIframe: boolean;
  version = environment.VERSION;
  menu = Menu;

  //version check against GitHub
  latestVersion: string;
  currentVersion: string;
  newVersionAvailable: boolean;

  idleState = 'Not started.';
  lastPing?: Date = null;

  public modalRef: BsModalRef;

  @ViewChild('childModal', { static: false }) childModal: ModalDirective;

  constructor(
    private route: Router,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private idle: Idle,
    keepalive: Keepalive,
    private http: HttpClient
  ) {
    this.routeEvent(this.route);
    this.authenticationService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.reset();
    });

    // fetch the latest version from the GitHub repository
    this.http
      .get(
        'https://api.github.com/repos/jhyderjhyder/idn-admin-console/releases/latest'
      )
      .subscribe((data: any) => {
        this.latestVersion = data.name;
        this.currentVersion = this.version;
        this.newVersionAvailable = this.latestVersion !== this.currentVersion;
        //console.log(this.latestVersion + "--" + this.currentVersion)
      });

    // sets an idle timeout of 10 minutes. After this setTimeout kicks in to logout the user
    idle.setIdle(60 * 60);
    // sets a timeout period of 1 min. after 1 min of inactivity, the user will be considered timed out and will be logged out.
    idle.setTimeout(60 * 30);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.';
      console.log(this.idleState);
      this.reset();
    });

    idle.onTimeout.subscribe(() => {
      if (this.currentUser != null) {
        this.childModal.hide();
        this.idleState = 'Timed out!';
        console.log(this.idleState);
        this.logout();
      }
    });

    idle.onIdleStart.subscribe(() => {
      if (this.currentUser != null) {
        this.idleState = "You've gone idle!";
        console.log(this.idleState);
        this.childModal.show();
      }
    });

    idle.onTimeoutWarning.subscribe(countdown => {
      if (this.currentUser != null) {
        this.idleState = 'You will time out in ' + countdown + ' seconds!';
        console.log(this.idleState);
      }
    });

    // sets the ping interval to 15 seconds
    keepalive.interval(15);

    keepalive.onPing.subscribe(() => (this.lastPing = new Date()));

    this.idle.watch();
  }

  reset() {
    if (this.currentUser) {
      this.idle.watch();
    } else {
      this.idle.stop();
    }
  }

  hideChildModal(): void {
    this.childModal.hide();
  }

  stay() {
    this.childModal.hide();
    this.reset();
  }

  logout() {
    this.childModal.hide();
    this.authenticationService.logout().subscribe(() => {
      //do something
    });
    this.route.navigate(['/login']);
  }

  routeEvent(router: Router) {
    router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        if (this.messageService.retainInNavigation) {
          this.messageService.retainInNavigation = false;
        } else {
          this.messageService.clearAll();
        }
      }
    });
  }
}
