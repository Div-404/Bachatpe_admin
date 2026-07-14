import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComPackageComponent } from './com-package.component';

describe('ComPackageComponent', () => {
  let component: ComPackageComponent;
  let fixture: ComponentFixture<ComPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComPackageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
