import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class SignupComponent {
  user = {
    username: '',
    email: '',
    password: '',
  };

  roles = {
    user: true,
    moderator: false,
    admin: false,
  };

  constructor(private authService: AuthService, private router: Router) {}

  signup() {
    const selectedRoles = Object.keys(this.roles).filter(
      (role) => this.roles[role as keyof typeof this.roles]
    );

    if (selectedRoles.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select at least one role.',
      });
      return;
    }

    const signupData = {
      ...this.user,
      role: selectedRoles,
    };

    this.authService
      .signup(signupData)
      .pipe(
        tap((response: any) => {
          console.log('Sign-up response:', response);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Account created successfully!',
          }).then(() => {
            this.router.navigate(['/signin']);
          });
        }),
        catchError((error) => {
          console.error('Error during sign up', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              error.error.message ||
              'An error occurred during sign up. Please try again.',
          });
          return of(null);
        })
      )
      .subscribe();
  }
}
