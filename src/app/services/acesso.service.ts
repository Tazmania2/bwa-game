import {Injectable} from '@angular/core';
import {Time} from "../model/time.model";
import {Usuario} from "../model/usuario.model";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AcessoService {

  basePath = environment.backend_url_base + '/team';

  // Cache para times e colaboradores
  private timesCache: Array<Time> | null = null;
  private colaboradoresCache: Map<number, Array<Usuario>> = new Map();
  private isLoadingTimes = false;
  private isLoadingColaboradores = false;
  private timesPromise: Promise<Array<Time>> | null = null;
  private colaboradoresPromises: Map<number, Promise<Array<Usuario>>> = new Map();

  constructor(private http: HttpClient) {
  }

  public async timesGestor(): Promise<Array<Time>> {
    // Se já está carregando, retorna a promise existente
    if (this.timesPromise) {
      return this.timesPromise;
    }

    // Se já foi carregado, retorna os dados em cache
    if (this.timesCache) {
      return this.timesCache;
    }

    this.isLoadingTimes = true;
    this.timesPromise = this.fetchTimesGestor();

    try {
      this.timesCache = await this.timesPromise;
      return this.timesCache;
    } finally {
      this.isLoadingTimes = false;
      this.timesPromise = null;
    }
  }

  private async fetchTimesGestor(): Promise<Array<Time>> {
    let path = this.basePath + '/managed-teams';

    return firstValueFrom(this.http.get<Array<Time>>(path));
  }

  public async colaboradoresGestor(time?: number): Promise<Array<Usuario>> {
    if (!time) return [];

    // Se já está carregando para este time, retorna a promise existente
    if (this.colaboradoresPromises.has(time)) {
      return this.colaboradoresPromises.get(time)!;
    }

    // Se já foi carregado para este time, retorna os dados em cache
    if (this.colaboradoresCache.has(time)) {
      return this.colaboradoresCache.get(time)!;
    }

    const promise = this.fetchColaboradoresGestor(time);
    this.colaboradoresPromises.set(time, promise);

    try {
      const colaboradores = await promise;
      this.colaboradoresCache.set(time, colaboradores);
      return colaboradores;
    } finally {
      this.colaboradoresPromises.delete(time);
    }
  }

  private async fetchColaboradoresGestor(time: number): Promise<Array<Usuario>> {
    let path = this.basePath + `/${time}/users`;

    return await firstValueFrom(this.http.get<any>(path));
  }

  /**
   * Limpa o cache de times
   */
  public clearTimesCache(): void {
    this.timesCache = null;
    this.timesPromise = null;
  }

  /**
   * Limpa o cache de colaboradores para um time específico ou todos
   */
  public clearColaboradoresCache(time?: number): void {
    if (time) {
      this.colaboradoresCache.delete(time);
      this.colaboradoresPromises.delete(time);
    } else {
      this.colaboradoresCache.clear();
      this.colaboradoresPromises.clear();
    }
  }

  /**
   * Limpa todo o cache
   */
  public clearAllCache(): void {
    this.clearTimesCache();
    this.clearColaboradoresCache();
  }

  /**
   * Verifica se está carregando times
   */
  public isTimesLoading(): boolean {
    return this.isLoadingTimes;
  }

  /**
   * Verifica se está carregando colaboradores
   */
  public isColaboradoresLoading(): boolean {
    return this.isLoadingColaboradores;
  }
} 