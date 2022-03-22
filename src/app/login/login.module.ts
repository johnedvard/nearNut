import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginMenuComponent } from './login-menu/login-menu.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [LoginMenuComponent],
  imports: [CommonModule, SharedModule],
  exports: [LoginMenuComponent],
})
export class LoginModule {}
