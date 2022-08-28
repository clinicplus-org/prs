import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  sideBarOpen = true;
  userId: string | null;

  constructor(
    private authService: AuthService
  ) {
    this.userId = this.authService.getUserId();
  }

  ngOnInit() {}


  sideBarToggler(event: any) {
    this.sideBarOpen = !this.sideBarOpen;
  }

  onLogout(isLogedOut: boolean): void {
    this.authService.logout();
  }
}
