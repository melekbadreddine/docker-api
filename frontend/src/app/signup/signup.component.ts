import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class SignupComponent {
  user = { email: '', username: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  signup() {
    this.authService.signup(this.user).subscribe(
      () => {
        this.router.navigate(['/signin']);
      },
      (error) => {
        console.error('Error during sign up', error);
      }
    );
  }
}
