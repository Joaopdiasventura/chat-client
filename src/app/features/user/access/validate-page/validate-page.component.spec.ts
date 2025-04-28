import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidatePageComponent } from './validate-page.component';

describe('ValidatePageComponent', () => {
  let component: ValidatePageComponent;
  let fixture: ComponentFixture<ValidatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidatePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
