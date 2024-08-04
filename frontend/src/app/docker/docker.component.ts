import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { DockerService } from '../_services/docker.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-docker',
  templateUrl: './docker.component.html',
  styleUrls: ['./docker.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DockerComponent implements OnInit {
  containers: any[] = [];
  images: any[] = [];
  imageToPull: any;
  isPulling = false;

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

  deleteContainer(id: string) {
    this.dockerService.deleteContainer(id).subscribe({
      next: (response) => {
        console.log('Container deleted successfully', response);
        this.loadContainers();
      },
      error: (error) => {
        console.error('Error deleting container', error);
        if (error.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'You do not have permission to delete this container.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete the container.',
          });
        }
      },
    });
  }

  createContainer(imageName: string) {
    Swal.fire({
      title: 'Create Container',
      html:
        '<input id="hostPort" class="swal2-input" placeholder="Host Port">' +
        '<input id="containerPort" class="swal2-input" placeholder="Container Port">',
      focusConfirm: false,
      preConfirm: () => {
        return {
          hostPort: (document.getElementById('hostPort') as HTMLInputElement)
            .value,
          containerPort: (
            document.getElementById('containerPort') as HTMLInputElement
          ).value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { hostPort, containerPort } = result.value;
        if (hostPort && containerPort) {
          this.dockerService
            .createContainer(imageName, Number(hostPort), Number(containerPort))
            .subscribe({
              next: (response) => {
                console.log('Container created successfully', response);
                this.loadContainers();
                Swal.fire(
                  'Success',
                  'Container created successfully',
                  'success'
                );
              },
              error: (error) => {
                console.error('Error creating container', error);
                Swal.fire('Error', 'Failed to create the container', 'error');
              },
            });
        } else {
          Swal.fire('Error', 'Please fill all the fields', 'error');
        }
      }
    });
  }

  pullImage() {
    if (this.imageToPull) {
      const [repository, tag] = this.imageToPull.split(':');
      this.isPulling = true; // Set loading state to true
      this.dockerService.pullImage(repository, tag || 'latest').subscribe({
        next: (response) => {
          console.log('Image pulled successfully', response);
          this.loadImages();
          Swal.fire('Success', 'Image pulled successfully', 'success');
        },
        error: (error) => {
          console.error('Error pulling image', error);
          Swal.fire('Error', 'Failed to pull the image', 'error');
        },
        complete: () => {
          this.isPulling = false;
        },
      });
    } else {
      Swal.fire('Error', 'Please enter an image name', 'error');
    }
  }
}
