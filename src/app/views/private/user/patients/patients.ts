import { Physicians } from '../physicians/physicians';

export interface Labels {
  label: string;
}

export interface Records {
  userId: string;
  timestamp: Date;
  hash?: string;
}

export interface Patients {
    id: string;
    physicians: Physicians[];
    labels: Labels[];
    records: Records[];
}

