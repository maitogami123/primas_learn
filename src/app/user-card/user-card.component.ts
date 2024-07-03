import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from './user-card.model';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  @Input() user!: User;
  @Output() deletedUserEvent = new EventEmitter<number>();

  constructor(private userService: UserService) {}

  handleDeleteUser(id: number) {
    console.log(id);
    this.userService.deleteUser(id).subscribe({
      next: (value) => {
        console.log(value);
        this.deletedUserEvent.next(id);
      },
    });
  }

  handleUpdateUser(updatedUser: User) {
    this.user = updatedUser;
  }
}
