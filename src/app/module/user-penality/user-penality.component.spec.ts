import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPenalityComponent } from './user-penality.component';

describe('UserPenalityComponent', () => {
  let component: UserPenalityComponent;
  let fixture: ComponentFixture<UserPenalityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPenalityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserPenalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
