import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';

import { Login, Register } from './auth';
import { environment } from 'src/environments/environment';
import { UserService } from '../views/private/user/user.service';

const BACKEND_URL = environment.endpoint + '/auth';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticated!: boolean;
  private token!: string | null;
  private userId!: string | null;
  private userEmail!: string | null;
  private authStatusListener = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {}

  getToken() {
    return localStorage.getItem('token');
  }

  getIsAuth() {
    return (localStorage.hasOwnProperty('token')) ? true : false;
  }

  getUserId() {
    return localStorage.getItem('userId');
  }

  getUserEmail() {
    return localStorage.getItem('userEmail');
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  get(userId: string) {
    return this.http.get<any>(BACKEND_URL + '/' + userId);
  }

  createUser(authRegister: any) {
    this.http.post<{message: string, user: any}>(BACKEND_URL + '/register', authRegister).subscribe((res) => {
      const authData = {
        email: authRegister.email,
        password: authRegister.password,
        remember: false
      };
      this.login(authData);
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  login(authData: any) {
    this.http.post<{token: string, userEmail: string, userId: string, publicKey: string}>(
      BACKEND_URL + '/login',
      authData
    )
    .subscribe(response => {

      const token = response.token;
      this.token = token;
      if (token) {

        this.userId = response.userId;
        this.userEmail = response.userEmail;

        this.authStatusListener.next(true);

        this.saveAuthData(token, this.userId, this.userEmail);
        this.userService.get(response.userId).subscribe(userData => {
          this.router.navigate(['/secure']);
        });
      }
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    this.token = authInformation.token;
    this.userId = authInformation.userId;
    this.userEmail = authInformation.userEmail;
    this.authStatusListener.next(true);
  }

  logout() {
    this.token = '';
    this.userId = '';
    this.userEmail = '';
    this.authStatusListener.next(false);
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  private saveAuthData(token: string, userId: string, userEmail: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userEmail', userEmail);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
  }

  private getAuthData() {
    const authToken = localStorage.getItem('token');
    const authUserId = localStorage.getItem('userId');
    const authUserEmail = localStorage.getItem('userEmail');
    return {
      token: authToken,
      userId: authUserId,
      userEmail: authUserEmail
    };
  }

  update(updateData: any, userId: string) {
    return this.http.put<any>(BACKEND_URL + '/' + userId, updateData);
  }
}
