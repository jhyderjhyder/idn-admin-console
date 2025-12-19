import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';
import { MultipleAccountsComponent } from './multiple-accounts-report.component';
import { SearchFilterPipe } from '../shared/search-filter.pipe';

describe('MultipleAccountsComponent', () => {
  let component: MultipleAccountsComponent;
  let fixture: ComponentFixture<MultipleAccountsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [MultipleAccountsComponent, SearchFilterPipe],
    imports: [FormsModule,
        ModalModule],
    providers: [{ provide: IDNService, useClass: MockIDNService }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
