import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() public type: string = '';
  @Input() public content: string = '';
  @Input() public onClick: () => void = () => {};
}
