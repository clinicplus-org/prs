import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  isLoading = false;
  registrationForm!: FormGroup;
  authSub!: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Register');

    this.registrationForm = new FormGroup({
      firstname: new FormControl(null, [
          Validators.required,
          Validators.maxLength(30)
        ]),
      lastname: new FormControl(null, [
          Validators.required,
          Validators.maxLength(30)
        ]),
      email: new FormControl(null, [
          Validators.required,
          Validators.email,
          Validators.maxLength(50)
        ]),
      password: new FormControl(null, [
          Validators.required,
          Validators.maxLength(12)
        ])
    });
  }

  get formControls() { return this.registrationForm.controls; }

  onSignup() {
    this.isLoading = true;

    const authRegister = {
      firstname: this.registrationForm.value.firstname,
      lastname: this.registrationForm.value.lastname,
      email: this.registrationForm.value.email,
      password: this.registrationForm.value.password
    };

    this.authService.createUser(authRegister);

    this.authSub = this.authService.getAuthStatusListener().subscribe((res) => {
      if (!res) {
        this.isLoading = false;
      }
    });
  }

  onLogin() {
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
