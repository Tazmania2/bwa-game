import { Injectable } from '@angular/core';
import { ApiProvider } from '../providers/api.provider';

export interface Campaign {
  id: number;
  created_at: string;
  name: string;
  client_id: string;
  starts_at: string;
  finishes_at: string;
  isDefault?: boolean; // Indica se é uma campanha padrão de fallback
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private currentCampaign: Campaign | null = null;
  private isLoading = false;
  private loadPromise: Promise<Campaign> | null = null;

  constructor(private apiProvider: ApiProvider) {}

  /**
   * Carrega a campanha atual do sistema
   * @returns Promise com os dados da campanha atual
   */
  async getCurrentCampaign(): Promise<Campaign> {
    // Se já está carregando, retorna a promise existente
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Se já foi carregado, retorna os dados em cache
    if (this.currentCampaign) {
      return this.currentCampaign;
    }

    this.isLoading = true;
    this.loadPromise = this.fetchCurrentCampaign();

    try {
      this.currentCampaign = await this.loadPromise;
      return this.currentCampaign;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  /**
   * Busca a campanha atual da API
   */
  private async fetchCurrentCampaign(): Promise<Campaign> {
    try {
      const response: any = await this.apiProvider.get('/campaign/current');
      
      // Verifica diferentes formatos possíveis de resposta
      let campaignData: any = null;
      
      if (response && response.data) {
        // Formato: { data: { ... } }
        campaignData = response.data;
      } else if (response && response.id) {
        // Formato: { id: 1, name: "...", ... }
        campaignData = response;
      } else if (Array.isArray(response) && response.length > 0) {
        // Formato: [{ id: 1, name: "...", ... }]
        campaignData = response[0];
      } else {
        throw new Error('Formato de resposta não reconhecido');
      }
      
      // Valida se os campos obrigatórios existem
      if (!campaignData.id || !campaignData.starts_at || !campaignData.finishes_at) {
        console.warn('Campos obrigatórios ausentes na resposta:', campaignData);
        throw new Error('Campos obrigatórios ausentes na resposta da API');
      }
      
      const campaign: Campaign = {
        id: campaignData.id,
        created_at: campaignData.created_at || new Date().toISOString(),
        name: campaignData.name || 'Temporada Atual',
        client_id: campaignData.client_id || 'default',
        starts_at: campaignData.starts_at,
        finishes_at: campaignData.finishes_at,
        isDefault: false // Campanha real da API
      };

      return campaign;
    } catch (error) {
      console.error('❌ Erro ao carregar campanha atual:', error);
      console.error('📋 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Retorna campanha padrão em caso de erro
      const defaultCampaign = this.getDefaultCampaign();
      return defaultCampaign;
    }
  }

  /**
   * Retorna uma campanha padrão em caso de erro
   */
  private getDefaultCampaign(): Campaign {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const defaultCampaign = {
      id: 1,
      created_at: startDate.toISOString(),
      name: 'Temporada Padrão',
      client_id: 'default',
      starts_at: this.formatToDateString(startDate),
      finishes_at: this.formatToDateString(endDate),
      isDefault: true // Indica que é uma campanha padrão de fallback
    };

    return defaultCampaign;
  }

  /**
   * Obtém a data de início da campanha
   */
  async getCampaignStartDate(): Promise<Date> {
    const campaign = await this.getCurrentCampaign();
    return this.parseDate(campaign.starts_at);
  }

  /**
   * Obtém a data de fim da campanha
   */
  async getCampaignEndDate(): Promise<Date> {
    const campaign = await this.getCurrentCampaign();
    return this.parseDate(campaign.finishes_at);
  }

  /**
   * Obtém o nome da campanha atual
   */
  async getCampaignName(): Promise<string> {
    const campaign = await this.getCurrentCampaign();
    return campaign.name;
  }

  /**
   * Obtém o ID da campanha atual
   */
  async getCampaignId(): Promise<number> {
    const campaign = await this.getCurrentCampaign();
    return campaign.id;
  }

  /**
   * Verifica se está carregando
   */
  isLoadingCampaign(): boolean {
    return this.isLoading;
  }

  /**
   * Verifica se a campanha já foi carregada
   */
  isCampaignLoaded(): boolean {
    return this.currentCampaign !== null;
  }

  /**
   * Limpa o cache da campanha
   */
  clearCache(): void {
    this.currentCampaign = null;
    this.loadPromise = null;
  }

  /**
   * Recarrega a campanha atual
   */
  async reloadCampaign(): Promise<Campaign> {
    this.clearCache();
    return this.getCurrentCampaign();
  }

  /**
   * Verifica se a campanha atual é real (da API) ou padrão (fallback)
   */
  async isRealCampaign(): Promise<boolean> {
    const campaign = await this.getCurrentCampaign();
    return !campaign.isDefault;
  }

  /**
   * Verifica se há uma campanha ativa (real ou padrão dentro do período)
   */
  async hasActiveRealCampaign(): Promise<boolean> {
    const campaign = await this.getCurrentCampaign();
    
    // Verifica se está dentro do período da campanha (real ou padrão)
    const now = new Date();
    const startDate = new Date(campaign.starts_at);
    const endDate = new Date(campaign.finishes_at);
    
    // Ajustar para fuso horário local - adicionar um dia ao final para considerar o dia inteiro
    endDate.setUTCHours(23, 59, 59, 999);
    
    const isWithinPeriod = now >= startDate && now <= endDate;
    
    console.log('🔍 DEBUG - Verificação de campanha no CampaignService:', {
      campaignName: campaign.name,
      now: now.toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isWithinPeriod,
      campaignIsDefault: campaign.isDefault
    });
    
    // Aceita tanto campanhas reais quanto padrão se estiverem no período
    return isWithinPeriod;
  }

  /**
   * Método de debug para testar a conectividade da API
   */
  async debugApiResponse(): Promise<void> {
    try {
      
      const response: any = await this.apiProvider.get('/campaign/current');
      
      if (response && response.data) {
      }
      
      if (response && response.id) {
      }
      
      if (Array.isArray(response)) {
      }
      
    } catch (error) {
    }
  }

  /**
   * Converte uma string de data para Date
   */
  private parseDate(dateString: string): Date {
    // Se está no formato YYYY-MM-DD, assume início do dia
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Tenta parsear como está
    return new Date(dateString);
  }

  /**
   * Formata uma data para o formato YYYY-MM-DD
   */
  private formatToDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }
} 