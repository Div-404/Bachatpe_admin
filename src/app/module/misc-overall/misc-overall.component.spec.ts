import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscOverallComponent } from './misc-overall.component';

describe('MiscOverallComponent', () => {
  let component: MiscOverallComponent;
  let fixture: ComponentFixture<MiscOverallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiscOverallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MiscOverallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
