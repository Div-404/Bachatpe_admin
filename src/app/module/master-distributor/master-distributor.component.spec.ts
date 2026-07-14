import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterDistributorComponent } from './master-distributor.component';

describe('MasterDistributorComponent', () => {
  let component: MasterDistributorComponent;
  let fixture: ComponentFixture<MasterDistributorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterDistributorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasterDistributorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
