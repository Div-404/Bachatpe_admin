import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPackageComponent } from './user-package.component';

describe('UserPackageComponent', () => {
  let component: UserPackageComponent;
  let fixture: ComponentFixture<UserPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPackageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
