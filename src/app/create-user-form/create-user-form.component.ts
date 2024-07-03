import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserService } from 'src/services/user.service';
import { User } from '../user-card/user-card.model';

@Component({
  selector: 'app-create-user-form',
  templateUrl: './create-user-form.component.html',
})
export class CreateUserFormComponent {
  @Output() closeFormEvent = new EventEmitter<any>();
  @Output() newUserAddedEvent = new EventEmitter<User>();

  fullNameControl = new FormControl<string>('');
  socialIdControl = new FormControl<string>('');
  fixedAddressControl = new FormControl<string>('');
  addressControl = new FormControl<string>('');

  constructor(private userService: UserService) {}

  handleCloseForm() {
    this.closeFormEvent.next(null);
  }

  onSubmitHandler() {
    this.userService
      .createUser({
        fullName: this.fullNameControl.value!,
        socialId: this.socialIdControl.value!,
        fixedAddress: this.fixedAddressControl.value!,
        address: this.addressControl.value!,
      })
      .subscribe({
        next: (value) => {
          console.log('Created user:', value);
          this.newUserAddedEvent.next(value);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
}
