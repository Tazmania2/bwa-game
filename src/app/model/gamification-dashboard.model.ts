// Player Models
export interface PlayerStatus {
  _id: string;
  name: string;
  email: string;
  level: number;
  seasonLevel: number;
  metadata: PlayerMetadata;
  created: number;
  updated: number;
}

export interface PlayerMetadata {
  area: string;
  time: string;
  squad: string;
  [key: string]: any;
}

// Point Models
export interface PointWallet {
  bloqueados: number;
  desbloqueados: number;
  moedas: number;
}

export interface PointCategory {
  category: string;
  shortName: string;
  _id: string;
}

// Progress Models
export interface SeasonProgress {
  metas: ProgressMetric;
  clientes: number;
  tarefasFinalizadas: number;
  seasonDates: {
    start: Date;
    end: Date;
  };
}

export interface ProgressMetric {
  current: number;
  target: number;
}

// KPI Models
export interface KPIData {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
}

// Company Models
export interface Company {
  id: string;
  name: string;
  cnpj: string;
  healthScore: number;
  kpi1: KPIData;
  kpi2: KPIData;
  kpi3: KPIData;
}

export interface CompanyDetails extends Company {
  processes: Process[];
  activities: Activity[];
  macros: Macro[];
}

// Process and Task Models
export interface Process {
  id: string;
  name: string;
  status: ProcessStatus;
  tasks: Task[];
  expanded?: boolean;
}

export interface Task {
  id: string;
  name: string;
  responsible: string;
  status: TaskStatus;
  dueDate?: Date;
}

export type ProcessStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

// Activity Models
export interface Activity {
  id: string;
  name: string;
  points: number;
  completedDate: Date;
}

export interface ActivityMetrics {
  pendentes: number;
  emExecucao: number;
  finalizadas: number;
  pontos: number;
}

export interface MacroMetrics {
  pendentes: number;
  incompletas: number;
  finalizadas: number;
}

export interface Macro {
  id: string;
  name: string;
  status: ProcessStatus;
  completedDate?: Date;
}
