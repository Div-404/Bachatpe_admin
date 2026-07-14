import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcutiveUpdateComponent } from './excutive-update.component';

describe('ExcutiveUpdateComponent', () => {
  let component: ExcutiveUpdateComponent;
  let fixture: ComponentFixture<ExcutiveUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExcutiveUpdateComponent]
    });
    fixture = TestBed.createComponent(ExcutiveUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
