import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRiskComponent } from './user-risk.component';

describe('UserRiskComponent', () => {
  let component: UserRiskComponent;
  let fixture: ComponentFixture<UserRiskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRiskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
