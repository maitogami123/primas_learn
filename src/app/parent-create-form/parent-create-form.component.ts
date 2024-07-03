import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Parent } from '../parent-card/parent.model';
import { ParentService } from 'src/services';

@Component({
  selector: 'app-parent-create-form',
  templateUrl: './parent-create-form.component.html',
})
export class ParentCreateFormComponent {
  @Input() userId: number;

  @Output() parentCreatedEvent = new EventEmitter<Parent>();
  @Output() cancelCreateEvent = new EventEmitter();

  fullNameControl = new FormControl<string>('');
  roleControl = new FormControl<string>('');
  ageControl = new FormControl<number>(0);

  constructor(private parentService: ParentService) {}

  cancelCreateHandler() {
    this.cancelCreateEvent.next(null);
  }

  createHandle() {
    this.parentService
      .createParent(this.userId, {
        fullName: this.fullNameControl.value!,
        age: this.ageControl.value!,
        role: this.roleControl.value!,
      })
      .subscribe({
        next: (createdParent) => {
          this.parentCreatedEvent.next(createdParent);
          this.cancelCreateHandler();
        },
        error: (error) => {
          alert('error!');
        },
      });
  }
}
