
export interface Label {
  label: string;
}

export interface Record {
  userId: string;
  timestamp: Date;
  hash?: string;
}

export interface Patient {
    id: string;
    physicians: Physician[];
    labels: Label[];
    records: Record[];
}

export interface Physician {
  userId: string;
  practices: Practice[];
  description: string;
  prc: string;
  ptr: string;
  s2: string;
  professionalFee: string;
  isVerified: boolean;
}

export interface Practice {
  practice: string;
  practiceYearExperience: number;
}
