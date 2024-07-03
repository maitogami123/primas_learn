import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UserService } from 'src/services/user.service';
import { User } from '../user-card/user-card.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  users: User[] = [];
  isAddingUser: boolean = false;
  error?: HttpErrorResponse;

  constructor(private userService: UserService) {}

  toggleAddUser() {
    this.isAddingUser = !this.isAddingUser;
  }

  handleAddUser(user: User) {
    this.users = [user, ...this.users];
    this.toggleAddUser();
  }

  handleRemoveUser(userId: number) {
    this.users = this.users.filter((user) => user.id !== userId);
  }

  ngOnInit(): void {
    this.userService.fetchUsers().subscribe({
      error: (error) => {
        this.error = error;
      },
      next: (response: User[]) => {
        this.users = response;
      },
    });
  }
}
