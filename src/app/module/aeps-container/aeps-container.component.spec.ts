import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AepsContainerComponent } from './aeps-container.component';

describe('AepsContainerComponent', () => {
  let component: AepsContainerComponent;
  let fixture: ComponentFixture<AepsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AepsContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AepsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
