import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUser } from 'src/app/create-user-form/create-user.model';
import { User } from 'src/app/user-card/user-card.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  fetchUsers(): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:3000/user');
  }

  createUser(newUser: CreateUser): Observable<User> {
    return this.http.post<User>('http://localhost:3000/user', {
      fullName: newUser.fullName,
      socialId: newUser.socialId,
      fixedAddress: newUser.fixedAddress,
      address: newUser.address,
    });
  }

  deleteUser(id: number) {
    return this.http.delete<any>(`http://localhost:3000/user/${id}`);
  }
}
