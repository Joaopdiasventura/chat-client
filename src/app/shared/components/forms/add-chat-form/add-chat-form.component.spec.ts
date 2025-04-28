import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChatFormComponent } from './add-chat-form.component';

describe('AddChatFormComponent', () => {
  let component: AddChatFormComponent;
  let fixture: ComponentFixture<AddChatFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddChatFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddChatFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
