import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: window['base-href'] || '', // using base href from itch.io if hosted on itch io's iframe.
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
