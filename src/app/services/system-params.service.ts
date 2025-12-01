import { Injectable } from '@angular/core';
import { ApiProvider } from '../providers/api.provider';
import { SystemParams, SystemParamValue } from '../model/system-params.model';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemParamsService {

  private readonly STORAGE_KEY = 'system_params';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em millisegundos
  private cachedParams: SystemParams | null = null;
  private lastFetchTime: number = 0;
  private isInitialized = false;
  private initializationPromise: Promise<SystemParams> | null = null;

  constructor(private api: ApiProvider, private http: HttpClient) {}

  /**
   * Inicializa os parâmetros do sistema no primeiro acesso
   * Pode ser chamado mesmo sem autenticação (ex: página de login)
   * Implementa singleton pattern para evitar múltiplas requisições simultâneas
   */
  public async initializeSystemParams(): Promise<SystemParams> {
    // Se já foi inicializado e o cache é válido, retorna imediatamente
    if (this.isInitialized && this.isCacheValid()) {
      return this.cachedParams!;
    }

    // Se já está inicializando, retorna a promise existente
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Cria nova promise de inicialização
    this.initializationPromise = this.performInitialization();

    try {
      const params = await this.initializationPromise;
      return params;
    } finally {
      // Limpa a promise após a inicialização
      this.initializationPromise = null;
    }
  }

  /**
   * Executa a inicialização real dos parâmetros
   */
  private async performInitialization(): Promise<SystemParams> {
    try {
      const params = await this.fetchFromApi();
      this.isInitialized = true;
      return params;
    } catch (error) {
      console.error('Erro na inicialização dos parâmetros do sistema:', error);
      
      // Se falhar na inicialização, tenta usar cache mesmo que expirado
      const storedData = this.getFromStorage();
      if (storedData) {
        console.warn('Usando dados do cache para inicialização devido a erro na API');
        this.cachedParams = storedData.params;
        this.lastFetchTime = storedData.timestamp;
        this.isInitialized = true;
        return this.cachedParams;
      }
      
      throw error;
    }
  }

  /**
   * Obtém os parâmetros do sistema, garantindo que foram inicializados
   */
  public async getSystemParams(): Promise<SystemParams> {
    // Se não foi inicializado, inicializa primeiro
    if (!this.isInitialized) {
      return this.initializeSystemParams();
    }

    // Verifica se há dados em cache válidos
    if (this.isCacheValid()) {
      return this.cachedParams!;
    }

    // Busca dados do localStorage
    const storedData = this.getFromStorage();
    if (storedData && this.isStorageValid(storedData.timestamp)) {
      this.cachedParams = storedData.params;
      this.lastFetchTime = storedData.timestamp;
      return this.cachedParams;
    }

    // Se não há cache válido, busca da API
    return this.fetchFromApi();
  }

  /**
   * Força a atualização dos parâmetros da API
   */
  public async refreshSystemParams(): Promise<SystemParams> {
    return this.fetchFromApi();
  }

  /**
   * Obtém um parâmetro específico do sistema
   * Aguarda a inicialização se necessário
   */
  public async getParam<T>(paramName: keyof SystemParams): Promise<T | null> {
    const params = await this.getSystemParams();
    const param = params[paramName];
    
    // Verifica se o parâmetro tem a propriedade 'value' (SystemParamValue)
    if (param && typeof param === 'object' && 'value' in param) {
      return (param as SystemParamValue).value;
    }
    
    // Para parâmetros que não seguem o padrão SystemParamValue (como reward_rules)
    return param as T;
  }

  /**
   * Verifica se um recurso está habilitado
   */
  public async isFeatureEnabled(featureName: keyof SystemParams): Promise<boolean> {
    const value = await this.getParam<boolean>(featureName);
    return value === true;
  }

  /**
   * Verifica se os parâmetros já foram inicializados
   */
  public isParamsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Verifica se está carregando os parâmetros
   */
  public isLoading(): boolean {
    return this.initializationPromise !== null;
  }

  /**
   * Limpa o cache dos parâmetros
   */
  public clearCache(): void {
    this.cachedParams = null;
    this.lastFetchTime = 0;
    this.isInitialized = false;
    this.initializationPromise = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Busca os parâmetros da API
   */
  private async fetchFromApi(): Promise<SystemParams> {
    try {
      const url = `/client/system-params`;
      
      const params = await firstValueFrom(this.http.get<SystemParams>(environment.backend_url_base + url));
      // Atualiza o cache
      this.cachedParams = params;
      this.lastFetchTime = Date.now();
      
      // Salva no localStorage
      this.saveToStorage(params);
      
      return params;
    } catch (error) {
      console.error('Erro ao buscar parâmetros do sistema:', error);
      
      // Se falhar, tenta retornar dados do cache mesmo que expirados
      if (this.cachedParams) {
        console.warn('Retornando dados do cache expirado devido a erro na API');
        return this.cachedParams;
      }
      
      throw error;
    }
  }

  /**
   * Verifica se o cache em memória é válido
   */
  private isCacheValid(): boolean {
    return this.cachedParams !== null && 
           (Date.now() - this.lastFetchTime) < this.CACHE_DURATION;
  }

  /**
   * Verifica se os dados do localStorage são válidos
   */
  private isStorageValid(timestamp: number): boolean {
    return (Date.now() - timestamp) < this.CACHE_DURATION;
  }

  /**
   * Obtém dados do localStorage
   */
  private getFromStorage(): { params: SystemParams; timestamp: number } | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erro ao ler parâmetros do localStorage:', error);
      return null;
    }
  }

  /**
   * Salva dados no localStorage
   */
  private saveToStorage(params: SystemParams): void {
    try {
      const data = {
        params,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar parâmetros no localStorage:', error);
    }
  }
} 