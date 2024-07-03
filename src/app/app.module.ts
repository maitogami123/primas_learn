import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, provideRouter } from '@angular/router';

import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { UserCardComponent } from './user-card/user-card.component';
import { CreateUserFormComponent } from './create-user-form/create-user-form.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { ErrorComponent } from './error/error.component';
import { ParentCardComponent } from './parent-card/parent-card.component';
import { ParentCreateFormComponent } from './parent-create-form/parent-create-form.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    UserCardComponent,
    CreateUserFormComponent,
    UserDetailsComponent,
    ErrorComponent,
    ParentCardComponent,
    ParentCreateFormComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      {
        path: 'user/:userId',
        component: UserDetailsComponent,
        pathMatch: 'full',
      },
      { path: '**', component: ErrorComponent },
    ]),
  ],
  providers: [
    provideHttpClient(),
    { provide: 'environment', useValue: environment },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
