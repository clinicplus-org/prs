import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { SettingService } from '../../private/setting/setting.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() toggleSideBar: EventEmitter<any> = new EventEmitter();
  @Output() logout = new EventEmitter<boolean>();
  @Input()
  isAuthenticated!: boolean;

  setting: any;
  userId: string | null;

  isAuth = true;
  showBadge: boolean;
  isLoading: boolean;

  constructor(
    private settingService: SettingService,
    private authService: AuthService
  ) {
    this.userId = this.authService.getUserId();
    this.showBadge = false;
    this.isLoading = true;
  }

  ngOnInit() {
    this.settingService.getSetting(this.userId);
    this.settingService.getSettingListener()
    .subscribe((setting: any) => {
      this.setting = setting;
      this.isLoading = false;
    });
  }

  onToggleSideBar() {
    this.toggleSideBar.emit();
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }

  onLogout() {
    this.logout.emit(this.isAuth);
  }
}
