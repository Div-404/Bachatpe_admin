import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageLmWkComponent } from './package-lm-wk.component';

describe('PackageLmWkComponent', () => {
  let component: PackageLmWkComponent;
  let fixture: ComponentFixture<PackageLmWkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageLmWkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PackageLmWkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
