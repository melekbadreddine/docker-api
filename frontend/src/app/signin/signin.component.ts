import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

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
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Signed in successfully!',
              timer: 1500,
              showConfirmButton: false,
            }).then(() => {
              this.router.navigate(['/docker']);
            });
          } else {
            console.error('No token received in the response');
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'An error occurred during sign in. Please try again.',
            });
          }
        }),
        catchError((error) => {
          console.error('Error during sign in', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              error.error?.message || 'Invalid credentials. Please try again.',
          });
          return of(null);
        })
      )
      .subscribe();
  }
}
