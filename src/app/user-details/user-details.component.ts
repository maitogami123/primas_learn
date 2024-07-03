import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { UserService } from 'src/services/user.service';
import { User } from '../user-card/user-card.model';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { Parent } from '../parent-card/parent.model';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
})
export class UserDetailsComponent {
  @Output() deletedUserEvent = new EventEmitter<number>();
  @Output() updatedUserEvent = new EventEmitter<User>();

  user$: Observable<User>;
  userId: number;
  user: User;

  fullNameControl = new FormControl<string>('');
  socialIdControl = new FormControl<string>('');
  fixedAddressControl = new FormControl<string>('');
  addressControl = new FormControl<string>('');

  isEditing: boolean = false;
  isCreatingParent: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user$ = this.route.paramMap.pipe(
      switchMap((params) => {
        this.userId = Number(params.get('userId'));
        return this.userService.getUser(this.userId);
      })
    );

    this.user$.subscribe({
      next: (value) => {
        this.user = value;
        this.fullNameControl.setValue(this.user.fullName);
        this.socialIdControl.setValue(this.user.socialId);
        this.fixedAddressControl.setValue(this.user.fixedAddress);
        this.addressControl.setValue(this.user.address);
      },
      error: (error: HttpErrorResponse) => {
        this.router.navigate(['error']);
      },
    });
  }

  toggleEditHandler() {
    this.isEditing = !this.isEditing;
  }

  toggleCreateParentHandler() {
    this.isCreatingParent = !this.isCreatingParent;
  }

  handleAddNewParent(parent: Parent) {
    this.user.parents = [...this.user.parents, parent];
  }

  handleRemoveParent(id: number) {
    this.user.parents = this.user.parents.filter((parent) => parent.id !== id);
  }

  handleCancelEdit() {
    this.fullNameControl.setValue(this.user.fullName);
    this.socialIdControl.setValue(this.user.socialId);
    this.fixedAddressControl.setValue(this.user.fixedAddress);
    this.addressControl.setValue(this.user.address);
    this.isEditing = false;
  }

  handleSubmitEdit(userId: number) {
    this.userService
      .patchUser(userId, {
        fullName: this.fullNameControl.value!,
        socialId: this.socialIdControl.value!,
        fixedAddress: this.fixedAddressControl.value!,
        address: this.addressControl.value!,
      })
      .subscribe({
        next: (value) => {
          this.updatedUserEvent.next(value);
        },
        error: (error: HttpErrorResponse) => {
          this.router.navigate(['error']);
        },
      });
    this.isEditing = false;
  }

  handleDeleteUser(id: number) {
    console.log(id);
    this.userService.deleteUser(id).subscribe({
      next: (value) => {
        this.deletedUserEvent.next(id);
        this.router.navigate(['']);
      },
    });
  }
}
