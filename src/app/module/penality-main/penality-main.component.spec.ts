import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenalityMainComponent } from './penality-main.component';

describe('PenalityMainComponent', () => {
  let component: PenalityMainComponent;
  let fixture: ComponentFixture<PenalityMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenalityMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PenalityMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
