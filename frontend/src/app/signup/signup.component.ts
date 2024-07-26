import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
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

    const signupData = {
      ...this.user,
      role: selectedRoles,
    };

    this.authService
      .signup(signupData)
      .pipe(
        tap((response: any) => {
          console.log('Sign-up response:', response);
          this.router.navigate(['/signin']);
        }),
        catchError((error) => {
          console.error('Error during sign up', error);
          return of(null);
        })
      )
      .subscribe();
  }
}
