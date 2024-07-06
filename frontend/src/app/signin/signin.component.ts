import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class SigninComponent {
  credentials = { username: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  signin() {
    this.authService
      .signin(this.credentials)
      .pipe(
        tap((response: any) => {
          console.log('Sign-in response:', response);
          if (response && response.accessToken) {
            this.authService.setToken(response.accessToken);
            console.log('Token stored:', response.accessToken);
            this.router.navigate(['/docker']);
          } else {
            console.error('No token received in the response');
          }
        }),
        catchError((error) => {
          console.error('Error during sign in', error);
          return of(null);
        })
      )
      .subscribe();
  }
}
