import { Injectable } from '@angular/core';
import { KPIData } from '@model/gamification-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class KPIMapper {
  /**
   * Map API response to KPIData model
   */
  toKPIData(apiResponse: any, defaultLabel: string = 'KPI'): KPIData {
    return {
      id: apiResponse._id || apiResponse.id || '',
      label: apiResponse.label || apiResponse.name || defaultLabel,
      current: apiResponse.current || apiResponse.value || 0,
      target: apiResponse.target || apiResponse.goal || 0,
      unit: apiResponse.unit || undefined
    };
  }

  /**
   * Map array of KPI responses or object with KPI fields
   * Dynamically extracts all KPIs from the API response
   */
  toKPIDataArray(apiResponses: any[] | any): KPIData[] {
    // If it's an array, map each item
    if (Array.isArray(apiResponses)) {
      return apiResponses.map((response, index) => 
        this.toKPIData(response, `KPI ${index + 1}`)
      );
    }
    
    // If it's an object (from cnpj_performance__c), extract KPI fields
    if (typeof apiResponses === 'object' && apiResponses !== null) {
      const kpis: KPIData[] = [];
      
      // Dynamically find all numbered KPIs (kpi1, kpi2, kpi3, kpi4, etc.)
      const numberedKpiKeys = Object.keys(apiResponses)
        .filter(key => /^kpi[_]?\d+$/i.test(key))
        .sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, ''), 10);
          const numB = parseInt(b.replace(/\D/g, ''), 10);
          return numA - numB;
        });
      
      for (const key of numberedKpiKeys) {
        const kpiData = apiResponses[key];
        const kpiNum = key.replace(/\D/g, '');
        
        if (typeof kpiData === 'object' && kpiData !== null) {
          kpis.push({
            id: key,
            label: kpiData.label || `KPI ${kpiNum}`,
            current: kpiData.current || kpiData.value || 0,
            target: kpiData.target || 10,
            unit: kpiData.unit || ''
          });
        } else {
          kpis.push({
            id: key,
            label: `KPI ${kpiNum}`,
            current: kpiData || 0,
            target: 10,
            unit: ''
          });
        }
      }
      
      // If no numbered KPIs found, check for named KPIs
      if (kpis.length === 0) {
        const namedKpis = ['nps', 'multas', 'eficiencia', 'prazo', 'qualidade', 'produtividade', 'satisfacao'];
        const namedKpiLabels: { [key: string]: string } = {
          nps: 'NPS',
          multas: 'Multas',
          eficiencia: 'Eficiência',
          prazo: 'Prazo',
          qualidade: 'Qualidade',
          produtividade: 'Produtividade',
          satisfacao: 'Satisfação'
        };
        
        for (const kpiName of namedKpis) {
          if (kpiName in apiResponses) {
            const kpiData = apiResponses[kpiName];
            if (typeof kpiData === 'object' && kpiData !== null) {
              kpis.push({
                id: kpiName,
                label: kpiData.label || namedKpiLabels[kpiName] || kpiName,
                current: kpiData.current || kpiData.value || 0,
                target: kpiData.target || 10,
                unit: kpiData.unit || ''
              });
            } else {
              kpis.push({
                id: kpiName,
                label: namedKpiLabels[kpiName] || kpiName,
                current: kpiData || 0,
                target: 10,
                unit: ''
              });
            }
          }
        }
      }
      
      // If still no KPIs, create default 3 KPIs
      if (kpis.length === 0) {
        kpis.push(
          { id: 'kpi1', label: 'KPI 1', current: 0, target: 10, unit: '' },
          { id: 'kpi2', label: 'KPI 2', current: 0, target: 10, unit: '' },
          { id: 'kpi3', label: 'KPI 3', current: 0, target: 10, unit: '' }
        );
      }
      
      return kpis;
    }
    
    return [];
  }
}
