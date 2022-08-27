import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  loginForm!: FormGroup;
  authSub!: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Login');

    this.loginForm = new FormGroup({
      email: new FormControl(null, [
          Validators.required,
          Validators.email,
          Validators.maxLength(50)
      ]),
      password: new FormControl(null, [
          Validators.required,
          Validators.maxLength(12)
      ]),
      remember: new FormControl(null)
    });

  }

  get formControls() { return this.loginForm.controls; }

  onLogin() {
    this.isLoading = true;

    const authData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      remember: this.loginForm.value.remember,
      role: 'physicians'
    };

    this.authService.login(authData);

    this.authSub = this.authService.getAuthStatusListener().subscribe((res) => {
      if (!res) {
        this.isLoading = false;
      }
    });
  }

  onSignup() {
    this.router.navigate(['/auth/register']);
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
