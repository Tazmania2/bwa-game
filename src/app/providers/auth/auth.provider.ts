import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../../environments/environment";
import {firstValueFrom, Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AuthProvider {
  constructor(private http: HttpClient) {
  }

  async login(email: string, password: string) {
    return firstValueFrom(this.http.post<LoginResponse>(`${environment.backend_url_base}/auth/login`, {
      email: email,
      password: password
    }));
  }

  userInfo(): Observable<any> {
    return this.http.get(`${environment.backend_url_base}/auth/user`);
  }

  async requestPasswordReset(email: string) {
    return firstValueFrom(this.http.post(`${environment.backend_url_base}/auth/password-reset/request`, {
      email: email
    }));
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    return firstValueFrom(this.http.post(`${environment.backend_url_base}/auth/password-reset/confirm`, {
      email: email,
      code: code,
      new_password: newPassword
    }));
  }
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
