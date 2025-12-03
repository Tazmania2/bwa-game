import { Injectable } from '@angular/core';
import { PlayerStatus, PointWallet, SeasonProgress, PlayerMetadata } from '@model/gamification-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerMapper {
  /**
   * Map Funifier API response to PlayerStatus model
   * Based on actual /v3/player/me/status response structure
   */
  toPlayerStatus(apiResponse: any): PlayerStatus {
    const levelProgress = apiResponse.level_progress || {};
    const nextLevel = levelProgress.next_level || {};
    
    return {
      _id: apiResponse._id || '',
      name: apiResponse.name || '',
      email: apiResponse._id || '', // _id is the email in Funifier
      level: nextLevel.position || 0,
      seasonLevel: nextLevel.position || 0,
      levelName: nextLevel.level || '',
      percentCompleted: levelProgress.percent_completed || 0,
      metadata: this.extractMetadata(apiResponse),
      created: apiResponse.created || Date.now(),
      updated: apiResponse.updated || Date.now()
    };
  }

  /**
   * Extract player metadata from API response
   * Teams info comes from teams array
   */
  private extractMetadata(apiResponse: any): PlayerMetadata {
    const extra = apiResponse.extra || {};
    const teams = apiResponse.teams || [];
    
    // Extract team info if available
    const teamInfo = teams.length > 0 ? teams[0] : {};
    
    return {
      area: extra.area || teamInfo.area || '',
      time: teamInfo.name || extra.time || '',
      squad: extra.squad || teamInfo.squad || '',
      ...extra
    };
  }

  /**
   * Map Funifier API response to PointWallet model
   * API fields: locked_points -> Bloqueados, points -> Desbloqueados, coins -> Moedas
   * 
   * The API response can have different structures:
   * 1. pointCategories.locked_points, pointCategories.points, pointCategories.coins
   * 2. point_categories.locked_points, point_categories.points, point_categories.coins
   * 3. Direct fields: locked_points, points, coins
   */
  toPointWallet(apiResponse: any): PointWallet {
    console.log('📊 Point wallet mapping - FULL API response keys:', Object.keys(apiResponse || {}));
    
    // Try multiple possible locations for point data
    const pointCategories = apiResponse?.pointCategories || apiResponse?.point_categories || {};
    
    console.log('📊 Point wallet mapping - pointCategories:', JSON.stringify(pointCategories));
    
    // Check for nested structure first, then direct fields
    let bloqueados = 0;
    let desbloqueados = 0;
    let moedas = 0;
    
    // Try pointCategories object
    if (pointCategories && typeof pointCategories === 'object') {
      bloqueados = Number(pointCategories.locked_points) || Number(pointCategories.lockedPoints) || 0;
      desbloqueados = Number(pointCategories.points) || 0;
      moedas = Number(pointCategories.coins) || 0;
    }
    
    // If still zero, try direct fields on response
    if (bloqueados === 0 && desbloqueados === 0 && moedas === 0) {
      bloqueados = Number(apiResponse?.locked_points) || Number(apiResponse?.lockedPoints) || 0;
      desbloqueados = Number(apiResponse?.points) || 0;
      moedas = Number(apiResponse?.coins) || 0;
    }
    
    // Also check for total_points as fallback for desbloqueados
    if (desbloqueados === 0) {
      desbloqueados = Number(apiResponse?.total_points) || Number(apiResponse?.totalPoints) || 0;
    }
    
    console.log('📊 Point wallet FINAL result:', { bloqueados, desbloqueados, moedas });
    
    return {
      bloqueados,
      desbloqueados,
      moedas
    };
  }

  /**
   * Map Funifier API response to SeasonProgress model
   * - clientes: count of extra.companies (separated by ; or ,)
   * - metas: will be populated separately from metric_targets__c
   * - tarefasFinalizadas: will be populated from action_log aggregate
   */
  toSeasonProgress(apiResponse: any, seasonDates: { start: Date; end: Date }): SeasonProgress {
    const extra = apiResponse.extra || {};
    
    // Count companies from extra.companies string (separated by ; or ,)
    const companiesStr = extra.companies || '';
    const clientesCount = this.countSeparatedValues(companiesStr);
    
    return {
      metas: {
        current: 0, // Will be populated from KPI data
        target: 0   // Will be populated from metric_targets__c
      },
      clientes: clientesCount,
      tarefasFinalizadas: 0, // Will be populated from action_log aggregate
      seasonDates
    };
  }

  /**
   * Count values in a string separated by ; or ,
   */
  private countSeparatedValues(str: string): number {
    if (!str || typeof str !== 'string') return 0;
    
    // Split by ; or , and filter out empty values
    const values = str.split(/[;,]/)
      .map(v => v.trim())
      .filter(v => v.length > 0);
    
    return values.length;
  }

  /**
   * Parse KPI values from extra.kpi string
   * Returns array of numbers in order
   */
  parseKpiValues(kpiString: string): number[] {
    if (!kpiString || typeof kpiString !== 'string') return [];
    
    return kpiString.split(/[;,]/)
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .map(v => parseFloat(v) || 0);
  }

  /**
   * Parse companies from extra.companies string
   * Returns array of company identifiers
   */
  parseCompanies(companiesString: string): string[] {
    if (!companiesString || typeof companiesString !== 'string') return [];
    
    return companiesString.split(/[;,]/)
      .map(v => v.trim())
      .filter(v => v.length > 0);
  }
}
