import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from './user-card.model';
import { UserService } from 'src/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  @Input() user!: User;
  @Output() deletedUserEvent = new EventEmitter<number>();

  constructor(private userService: UserService) {}

  handleDeleteUser(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your file has been deleted.',
              icon: 'success',
            }).then(() => {
              this.deletedUserEvent.next(id);
            });
          },
        });
      }
    });
  }

  handleUpdateUser(updatedUser: User) {
    this.user = updatedUser;
  }
}
