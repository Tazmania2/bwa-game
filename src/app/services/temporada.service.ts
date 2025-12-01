import {Injectable} from '@angular/core';
import {TemporadaDashboard} from '../model/temporadaDashboard.model';
import {ApiProvider} from "../providers/api.provider";
import {TIPO_CONSULTA_TIME} from "@app/pages/dashboard/dashboard.component";
import {SeasonDatesService} from "./season-dates.service";

@Injectable({
  providedIn: 'root'
})
export class TemporadaService {

  basePath = '/game/stats';

  constructor(
    private api: ApiProvider,
    private seasonDatesService: SeasonDatesService
  ) {
  }

  public async getDadosTemporadaDashboard(id: number, tipo: number): Promise<TemporadaDashboard> {
    let url = this.basePath;
    
    // Obter datas da temporada (campanha) no formato ISO
    const startDateISO = await this.seasonDatesService.getSeasonStartDateISO();
    const endDateISO = await this.seasonDatesService.getSeasonEndDateISO();
    
    let queryParams = '?start=' + startDateISO + '&end=' + endDateISO;

    if (tipo === TIPO_CONSULTA_TIME) {
      url = '/game/team-stats';
      queryParams += '&team=' + id;
    } else {
      queryParams += '&user=' + id;
    }

    const response = await this.api.get<any>(url + queryParams);

    return <TemporadaDashboard>{
      blocked_points: response?.action_stats.total_blocked_points || 0,
      unblocked_points: response?.action_stats.total_points || 0,
      pendingTasks: response?.action_stats.PENDING.count || 0,
      completedTasks: response?.action_stats.DONE.count || 0,
      pendingDeliveries: response?.delivery_stats.PENDING || 0,
      incompleteDeliveries: response?.delivery_stats.INCOMPLETE || 0,
      completedDeliveries: response?.delivery_stats.DELIVERED || 0,
    }
  }

}
