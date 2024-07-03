import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { UserService } from 'src/services/user.service';
import { User } from '../user-card/user-card.model';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { Parent } from '../parent-card/parent.model';
import { UserDetail } from './model/user-details.model';
import { ImageService } from 'src/services/image.service';
import { HTMLInputEvent } from 'src/common/interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
})
export class UserDetailsComponent {
  @Output() deletedUserEvent = new EventEmitter<number>();
  @Output() updatedUserEvent = new EventEmitter<User>();

  user$: Observable<UserDetail>;
  userId: number;
  user: UserDetail;

  // Move to form group
  fullNameControl = new FormControl<string>('');
  socialIdControl = new FormControl<string>('');
  fixedAddressControl = new FormControl<string>('');
  addressControl = new FormControl<string>('');
  imagesControl = new FormControl<File[]>([]);

  isEditing: boolean = false;
  isCreatingParent: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private imageService: ImageService,
    private userService: UserService
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
              this.router.navigate(['']);
            });
          },
        });
      }
    });
  }

  handleDeleteImage(id: string) {
    this.imageService.deleteImage(+id).subscribe({
      next: () => {
        this.user.images = this.user.images.filter((image) => image.id === id);
      },
    });
  }

  fileToUpload: File | null = null;

  handleFileInput(event: Event) {
    const fileEvent = event as HTMLInputEvent;
    if (fileEvent.target.files) this.fileToUpload = fileEvent.target.files[0];
    console.log(fileEvent);
  }

  uploadFileToActivity(userId: number) {
    this.imageService.postFile(this.fileToUpload!, userId).subscribe(
      (data) => {
        // do something, if upload success
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
