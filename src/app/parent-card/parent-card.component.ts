import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Parent } from './parent.model';
import { ParentService } from 'src/services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-parent-card',
  templateUrl: './parent-card.component.html',
})
export class ParentCardComponent {
  @Input() parent: Parent;
  @Output() parentDeletedEvent = new EventEmitter<number>();

  isEditing: boolean = false;
  isLoading: boolean = false;

  fullNameControl = new FormControl<string>('');
  roleControl = new FormControl<string>('');
  ageControl = new FormControl<number>(0);

  constructor(private parentService: ParentService) {}

  ngOnInit(): void {
    this.fullNameControl.setValue(this.parent.fullName);
    this.roleControl.setValue(this.parent.role);
    this.ageControl.setValue(this.parent.age);
  }

  toggleEditting() {
    this.isEditing = !this.isEditing;
  }

  cancelEditHandler() {
    this.fullNameControl.setValue(this.parent.fullName);
    this.roleControl.setValue(this.parent.role);
    this.ageControl.setValue(this.parent.age);
    this.isEditing = false;
  }

  updateParentHandler(id: number) {
    this.isLoading = true;
    this.parentService
      .patchParent(id, {
        fullName: this.fullNameControl.value!,
        age: this.ageControl.value!,
        role: this.roleControl.value!,
      })
      .subscribe({
        next: (value) => {
          this.parent = { ...value };
          console.log(value);
        },
        complete: () => {
          this.isLoading = false;
          this.isEditing = false;
        },
      });
  }

  deleteParentHandler(id: number) {
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
        this.parentService.deleteParent(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your file has been deleted.',
              icon: 'success',
            }).then(() => {
              this.parentDeletedEvent.next(id);
            });
          },
        });
      }
    });
  }
}
