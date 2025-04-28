import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteListComponent } from './invite-list.component';

describe('InviteListComponent', () => {
  let component: InviteListComponent;
  let fixture: ComponentFixture<InviteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InviteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
