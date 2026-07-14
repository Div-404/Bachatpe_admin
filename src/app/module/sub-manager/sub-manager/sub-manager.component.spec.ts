import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubManagerComponent } from './sub-manager.component';

describe('SubManagerComponent', () => {
  let component: SubManagerComponent;
  let fixture: ComponentFixture<SubManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubManagerComponent]
    });
    fixture = TestBed.createComponent(SubManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
