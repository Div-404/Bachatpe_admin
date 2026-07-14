import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveComponent } from './executive.component';

describe('ExecutiveComponent', () => {
  let component: ExecutiveComponent;
  let fixture: ComponentFixture<ExecutiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExecutiveComponent]
    });
    fixture = TestBed.createComponent(ExecutiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
