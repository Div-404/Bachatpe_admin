import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsTaxComponent } from './reports-tax.component';

describe('ReportsTaxComponent', () => {
  let component: ReportsTaxComponent;
  let fixture: ComponentFixture<ReportsTaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsTaxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportsTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
