import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportcreditMainComponent } from './reportcredit-main.component';

describe('ReportcreditMainComponent', () => {
  let component: ReportcreditMainComponent;
  let fixture: ComponentFixture<ReportcreditMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportcreditMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportcreditMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
