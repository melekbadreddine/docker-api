import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { DockerService } from '../_services/docker.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-docker',
  templateUrl: './docker.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class DockerComponent implements OnInit {
  containers: any[] = [];
  images: any[] = [];

  constructor(
    private dockerService: DockerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      console.log('User is authenticated, loading containers and images');
      this.loadContainers();
      this.loadImages();
    } else {
      console.log('User is not authenticated, redirecting to signin');
      this.router.navigate(['/signin']);
    }
  }

  loadContainers() {
    this.dockerService.getContainers().subscribe({
      next: (data: any) => {
        console.log('Containers loaded successfully:', data);
        this.containers = data;
      },
      error: (error) => {
        console.error('Error loading containers', error);
        if (error.status === 401) {
          console.log('Unauthorized access, logging out');
          this.authService.logout();
          this.router.navigate(['/signin']);
        }
      },
    });
  }

  loadImages() {
    this.dockerService.getImages().subscribe({
      next: (data: any) => {
        console.log('Images loaded successfully:', data);
        this.images = data;
      },
      error: (error) => {
        console.error('Error loading images', error);
        if (error.status === 401) {
          console.log('Unauthorized access, logging out');
          this.authService.logout();
          this.router.navigate(['/signin']);
        }
      },
    });
  }

  startContainer(id: string) {
    this.dockerService.startContainer(id).subscribe({
      next: (response) => {
        console.log('Container started successfully', response);
        this.loadContainers();
      },
      error: (error) => {
        console.error('Error starting container', error);
        if (error.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'You do not have permission to start this container.',
          });
        }
      },
    });
  }

  stopContainer(id: string) {
    this.dockerService.stopContainer(id).subscribe({
      next: (response) => {
        console.log('Container stopped successfully', response);
        this.loadContainers();
      },
      error: (error) => {
        console.error('Error stopping container', error);
        if (error.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'You do not have permission to stop this container.',
          });
        }
      },
    });
  }

  deleteImage(imageName: string) {
    this.dockerService.deleteImage(imageName).subscribe({
      next: (response) => {
        console.log('Image deleted successfully', response);
        this.loadImages();
      },
      error: (error) => {
        console.error('Error deleting image', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        if (error.error instanceof ErrorEvent) {
          console.error('Client-side error:', error.error.message);
        } else {
          console.error('Server-side error:', error.error);
        }
        if (error.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'You do not have permission to delete this image.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete the image. It might be in use by a container.',
          });
        }
      },
    });
  }
}
