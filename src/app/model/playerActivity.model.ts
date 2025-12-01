import {
} from '@utils/constants';

export interface EvidencesEntity {
  name: string;
  url: string;
}

export type IPlayerActivity = {
  id: string;
  idApp: string;
  idSystemActivity: string;
  platformOrigin?: string;
  name: string;
  points: number;
  executorIdApp: string;
  teamIdApp: string;
  coordinadorIdApp: string;
  techLeadIdApp?: string;
  finishDate: Date;
  unblockDate: Date;
  unblockMacroDate?: Date;
  unblockStepDate?: Date;
  endUnblockDate?: Date;
  expirationDate?: Date;
  bonusPercentage: number;
  penaltyPercentage: number;
  type: any;
  status: any;
  evidences: Array<EvidencesEntity>;
  player: { id: string; name: string };
  reasonText?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};
