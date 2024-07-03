import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Parent } from 'src/app/parent-card/parent.model';
import { CreateParent } from 'src/app/parent-create-form/model/create-parent.model';
import { UpdateParent } from 'src/app/parent-create-form/model/update-parent.model';

@Injectable({ providedIn: 'root' })
export class ParentService {
  private URL = 'http://localhost:3000/parent';

  constructor(private http: HttpClient) {}

  createParent(userId: number, newParent: CreateParent): Observable<Parent> {
    return this.http.post<Parent>(this.URL, {
      userId: userId,
      ...newParent,
    });
  }

  patchParent(id: number, updateParent: UpdateParent): Observable<Parent> {
    return this.http.patch<Parent>(`${this.URL}/${id}`, {
      ...updateParent,
    });
  }

  deleteParent(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }
}
