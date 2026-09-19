import { Component } from '@angular/core';
import { Auth } from '../../../servicios/auth';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-footer',
  styleUrl: './footer.css',
  templateUrl: './footer.html',
})
export class Footer {

  constructor(private auth: Auth, private router: Router) {}

  async salir() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}

