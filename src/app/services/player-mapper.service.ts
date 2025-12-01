import { Injectable } from '@angular/core';
import { PlayerStatus, PointWallet, SeasonProgress, PlayerMetadata } from '@model/gamification-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerMapper {
  /**
   * Map Funifier API response to PlayerStatus model
   */
  toPlayerStatus(apiResponse: any): PlayerStatus {
    return {
      _id: apiResponse._id || '',
      name: apiResponse.name || '',
      email: apiResponse.email || '',
      level: apiResponse.level_progress?.next_level?.position || 0,
      seasonLevel: apiResponse.extra?.seasonLevel || apiResponse.level || 0,
      metadata: this.extractMetadata(apiResponse),
      created: apiResponse.created || Date.now(),
      updated: apiResponse.updated || Date.now()
    };
  }

  /**
   * Extract player metadata from API response
   */
  private extractMetadata(apiResponse: any): PlayerMetadata {
    const extra = apiResponse.extra || {};
    return {
      area: extra.area || '',
      time: extra.time || '',
      squad: extra.squad || '',
      ...extra
    };
  }

  /**
   * Map Funifier API response to PointWallet model
   */
  toPointWallet(apiResponse: any): PointWallet {
    const pointCategories = apiResponse.point_categories || {};
    
    // Handle different possible response structures
    let bloqueados = 0;
    let desbloqueados = 0;
    let moedas = 0;

    if (Array.isArray(pointCategories)) {
      // If point_categories is an array
      pointCategories.forEach((category: any) => {
        const name = category.category?.toLowerCase() || category.shortName?.toLowerCase() || '';
        const value = category.value || 0;
        
        // Check for desbloqueados first (more specific)
        if (name.includes('desbloqueado')) {
          desbloqueados = value;
        } else if (name.includes('bloqueado')) {
          bloqueados = value;
        } else if (name.includes('moeda')) {
          moedas = value;
        }
      });
    } else if (typeof pointCategories === 'object') {
      // If point_categories is an object
      bloqueados = pointCategories.bloqueados || pointCategories.Bloqueados || 0;
      desbloqueados = pointCategories.desbloqueados || pointCategories.Desbloqueados || 0;
      moedas = pointCategories.moedas || pointCategories.Moedas || 0;
    }

    return {
      bloqueados,
      desbloqueados,
      moedas
    };
  }

  /**
   * Map Funifier API response to SeasonProgress model
   */
  toSeasonProgress(apiResponse: any, seasonDates: { start: Date; end: Date }): SeasonProgress {
    const progress = apiResponse.progress || {};
    
    return {
      metas: {
        current: progress.metas?.current || 0,
        target: progress.metas?.target || 0
      },
      clientes: progress.clientes || 0,
      tarefasFinalizadas: progress.tarefasFinalizadas || progress.tasks_completed || 0,
      seasonDates
    };
  }
}
