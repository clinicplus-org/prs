import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';


import { User } from './user';
import { environment } from 'src/environments/environment';


const BACKEND_URL = environment.endpoint + '/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private users: User[] = [];
  private usersUpdated = new Subject<{ users: User[], counts: number }>();
  private usersSub = new Subject<any>();

  constructor(
    private http: HttpClient
  ) {}

  getAll(perPage: number, currentPage: number) {
    const queryParams = `?pagesize=${perPage}&page=${currentPage}`;
    this.http.get<{message: string, users: any, counts: number }>(
      BACKEND_URL + queryParams
    )
    .pipe(
      map(userData => {
        return { users: userData.users.map((user: { _id: any; name: any; contact: any; gender: any; birthdate: any; address: any; createdAt: any; updatedAt: any; metas: any; physicians: any; }) => {
          return {
            id: user._id,
            name: user.name,
            contact: user.contact,
            gender: user.gender,
            birthdate: user.birthdate,
            address: user.address,
            created: user.createdAt,
            updated: user.updatedAt,
            meta: user.metas,
            physicians: user.physicians
          };
        }), max: userData.counts};
      })
    )
    .subscribe((transformData) => {
      this.users = transformData.users;
      this.usersUpdated.next({
        users: [...this.users],
        counts: transformData.max
      });
    });
  }

  getUpdateListener() {
    return this.usersUpdated.asObservable();
  }

  setSubListener(data: any) {
    this.usersSub.next(data);
  }

  getSubListener() {
    return this.usersSub.asObservable();
  }

  get(userId: string) {
    return this.http.get<any>(BACKEND_URL + '/' + userId);
  }

  insert(newUser: any) {
    return this.http.post<{ message: string, user: User, id: string }>(BACKEND_URL, newUser);
  }

  update(updatedUser: any) {
    return this.http.put<User>(BACKEND_URL + '/' + updatedUser._id, updatedUser);
  }

  delete(patientId: string) {
    return this.http.delete<{ message: string }>(BACKEND_URL + '/' + patientId);
  }

}
