import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUser } from 'src/app/create-user-form/create-user.model';
import { User } from 'src/app/user-card/user-card.model';
import { UpdateUser } from 'src/app/user-details/model/update-user.model';
import { UserDetail } from 'src/app/user-details/model/user-details.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  fetchUsers(): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:3000/user');
  }

  getUser(id: number): Observable<UserDetail> {
    return this.http.get<UserDetail>(`http://localhost:3000/user/${id}`);
  }

  createUser(newUser: CreateUser): Observable<User> {
    return this.http.post<User>('http://localhost:3000/user', {
      ...newUser,
    });
  }

  patchUser(id: number, updateUser: UpdateUser): Observable<User> {
    return this.http.patch<User>(`http://localhost:3000/user/${id}`, {
      ...updateUser,
    });
  }

  deleteUser(id: number) {
    return this.http.delete<any>(`http://localhost:3000/user/${id}`);
  }
}
