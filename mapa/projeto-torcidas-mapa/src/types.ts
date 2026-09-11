export type AllianceBloc = 
  | 'punho_cruzado' 
  | 'dedo_pro_alto' 
  | 'punho_colado'
  | 'alianca_alvinegra'
  | 'nordeste_lado_a'
  | 'nordeste_lado_b'
  | 'sp_familia_interior'
  | 'sp_punho_seguro'
  | 'sp_irmandade'
  | 'regional_historica' 
  | 'independente';

export type NodeTier = 'nacional' | 'regional' | 'local';

export type ConnectionType = 
  | 'amizade' 
  | 'rivalidade' 
  | 'historica' 
  | 'classico';

export interface TorcidaNode {
  id: string;
  name: string;
  shortName?: string;
  club: string;
  uf: string;
  city: string;
  region: 'Sudeste' | 'Sul' | 'Nordeste' | 'Centro-Oeste' | 'Norte';
  bloc: AllianceBloc;
  blocName: string;
  secondaryBlocs?: AllianceBloc[];
  allianceTagline?: string;
  tier: NodeTier;
  // Map coordinates (normalized percentage 0-100 on Brazil projection)
  mapX: number;
  mapY: number;
  clubColors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  founded?: string;
  description?: string;
}

export interface NetworkConnection {
  id: string;
  source: string; // TorcidaNode id
  target: string; // TorcidaNode id
  type: ConnectionType;
  label?: string;
  historicalNote?: string;
}

export interface Derby {
  id: string;
  name: string;
  region: 'Sudeste' | 'Sul' | 'Nordeste' | 'Centro-Oeste e Norte';
  uf: string;
  club1: string;
  club2: string;
  torcida1: string;
  torcida2: string;
  notes?: string;
}

export interface SpotlightCard {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  featuredTorcidas: string[];
  uf: string;
  iconName: string;
}
