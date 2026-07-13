export interface MwSound {
  audio?: string;
}

export interface MwPrs {
  ipa?: string;
  sound?: MwSound;
}

export interface MwHwi {
  hw?: string;
  prs?: MwPrs[];
}

export type MwDtItem = 
  | ['text', string] 
  | ['vis', { t: string }[]] 
  | ['snote', any];

export interface MwSenseData {
  dt?: MwDtItem[];
}

export type MwSenseTuple = [string, MwSenseData];

export type MwSseqArray = MwSenseTuple[];

export interface MwDef {
  sseq?: MwSseqArray[];
}

export interface MwDro {
  drp?: string;
  def?: MwDef[];
}

export interface MwEntry {
  meta?: { stems?: string[] };
  hwi?: MwHwi;
  fl?: string;
  def?: MwDef[];
  dros?: MwDro[];
}

export interface MwThesaurusEntry {
  meta?: {
    syns?: string[][];
    ants?: string[][];
  };
}
