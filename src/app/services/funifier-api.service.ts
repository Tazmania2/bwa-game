import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthCredentials {
  apiKey: string;
  grant_type: string;
  username: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class FunifierApiService {
  private readonly baseUrl = 'https://service2.funifier.com';
  private authToken: string | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Authenticate with Funifier API
   */
  authenticate(credentials: AuthCredentials): Observable<AuthToken> {
    return this.http.post<AuthToken>(`${this.baseUrl}/auth/token`, credentials).pipe(
      tap(response => {
        this.authToken = response.access_token;
        localStorage.setItem('funifier_token', response.access_token);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET request to Funifier API
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    
    return this.http.get<T>(url, { headers, params }).pipe(
      retry({ count: 3, delay: 1000 }),
      catchError(this.handleError)
    );
  }

  /**
   * POST request to Funifier API
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    const headers = this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    
    return this.http.post<T>(url, body, { headers }).pipe(
      retry({ count: 3, delay: 1000 }),
      catchError(this.handleError)
    );
  }

  /**
   * Get authorization headers for Funifier API
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Funifier-Request': 'true' // Marker to prevent auth interceptor from overriding
    });

    const token = this.authToken || localStorage.getItem('funifier_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro ao comunicar com o servidor de gamificação';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erro de conexão: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Erro de conexão. Verifique sua internet.';
          break;
        case 401:
          errorMessage = 'Sessão expirada. Faça login novamente.';
          break;
        case 403:
          errorMessage = 'Acesso negado.';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado.';
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    console.error('Funifier API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Clear stored authentication token
   */
  clearAuth(): void {
    this.authToken = null;
    localStorage.removeItem('funifier_token');
  }
}
