// High-accuracy SVG paths for all 26 Brazilian states + Distrito Federal
// Normalized in a 1000x900 coordinate space with bounding boxes and state centroids for smooth zoom-to-state
export interface BrazilStateGeo {
  uf: string;
  name: string;
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  centroid: { x: number; y: number };
  zoomBox: { x: number; y: number; width: number; height: number };
  path: string;
}

export const BRAZIL_STATES_GEO: BrazilStateGeo[] = [
  // ==================== NORTE ====================
  {
    uf: 'RR',
    name: 'Roraima',
    region: 'Norte',
    centroid: { x: 310, y: 110 },
    zoomBox: { x: 230, y: 30, width: 180, height: 170 },
    path: 'M 285,45 L 340,55 L 360,110 L 335,160 L 290,165 L 265,115 L 285,45 Z'
  },
  {
    uf: 'AP',
    name: 'Amapá',
    region: 'Norte',
    centroid: { x: 570, y: 130 },
    zoomBox: { x: 510, y: 70, width: 140, height: 140 },
    path: 'M 540,85 L 595,110 L 590,170 L 555,175 L 535,135 L 540,85 Z'
  },
  {
    uf: 'AM',
    name: 'Amazonas',
    region: 'Norte',
    centroid: { x: 280, y: 250 },
    zoomBox: { x: 80, y: 130, width: 400, height: 280 },
    path: 'M 180,180 L 270,145 L 335,165 L 380,210 L 440,225 L 435,320 L 375,345 L 340,400 L 220,380 L 160,350 L 100,320 L 110,240 L 180,180 Z'
  },
  {
    uf: 'PA',
    name: 'Pará',
    region: 'Norte',
    centroid: { x: 540, y: 245 },
    zoomBox: { x: 410, y: 120, width: 280, height: 270 },
    path: 'M 440,225 L 535,135 L 590,170 L 650,210 L 640,290 L 610,340 L 560,390 L 485,395 L 435,320 L 440,225 Z'
  },
  {
    uf: 'AC',
    name: 'Acre',
    region: 'Norte',
    centroid: { x: 135, y: 380 },
    zoomBox: { x: 60, y: 330, width: 170, height: 120 },
    path: 'M 75,350 L 155,340 L 195,385 L 180,415 L 125,410 L 75,350 Z'
  },
  {
    uf: 'RO',
    name: 'Rondônia',
    region: 'Norte',
    centroid: { x: 285, y: 430 },
    zoomBox: { x: 210, y: 360, width: 170, height: 160 },
    path: 'M 220,380 L 305,380 L 335,420 L 330,475 L 265,490 L 225,435 L 220,380 Z'
  },
  {
    uf: 'TO',
    name: 'Tocantins',
    region: 'Norte',
    centroid: { x: 595, y: 420 },
    zoomBox: { x: 530, y: 330, width: 140, height: 200 },
    path: 'M 560,345 L 610,340 L 630,425 L 615,505 L 570,500 L 565,415 L 560,345 Z'
  },

  // ==================== NORDESTE ====================
  {
    uf: 'MA',
    name: 'Maranhão',
    region: 'Nordeste',
    centroid: { x: 690, y: 280 },
    zoomBox: { x: 620, y: 200, width: 170, height: 180 },
    path: 'M 640,215 L 725,230 L 750,290 L 720,360 L 660,370 L 640,290 L 640,215 Z'
  },
  {
    uf: 'PI',
    name: 'Piauí',
    region: 'Nordeste',
    centroid: { x: 745, y: 355 },
    zoomBox: { x: 680, y: 270, width: 150, height: 190 },
    path: 'M 725,230 L 770,265 L 795,350 L 760,430 L 715,425 L 720,360 L 725,230 Z'
  },
  {
    uf: 'CE',
    name: 'Ceará',
    region: 'Nordeste',
    centroid: { x: 825, y: 290 },
    zoomBox: { x: 760, y: 235, width: 140, height: 130 },
    path: 'M 770,265 L 850,265 L 870,310 L 840,355 L 795,350 L 770,265 Z'
  },
  {
    uf: 'RN',
    name: 'Rio Grande do Norte',
    region: 'Nordeste',
    centroid: { x: 885, y: 320 },
    zoomBox: { x: 840, y: 280, width: 110, height: 90 },
    path: 'M 850,265 L 920,295 L 925,335 L 870,335 L 850,265 Z'
  },
  {
    uf: 'PB',
    name: 'Paraíba',
    region: 'Nordeste',
    centroid: { x: 890, y: 360 },
    zoomBox: { x: 835, y: 325, width: 125, height: 80 },
    path: 'M 840,355 L 870,335 L 935,345 L 930,375 L 845,380 L 840,355 Z'
  },
  {
    uf: 'PE',
    name: 'Pernambuco',
    region: 'Nordeste',
    centroid: { x: 865, y: 405 },
    zoomBox: { x: 765, y: 365, width: 195, height: 95 },
    path: 'M 780,410 L 845,380 L 930,375 L 920,420 L 855,425 L 780,410 Z'
  },
  {
    uf: 'AL',
    name: 'Alagoas',
    region: 'Nordeste',
    centroid: { x: 890, y: 440 },
    zoomBox: { x: 845, y: 410, width: 95, height: 75 },
    path: 'M 855,425 L 920,420 L 905,460 L 870,455 L 855,425 Z'
  },
  {
    uf: 'SE',
    name: 'Sergipe',
    region: 'Nordeste',
    centroid: { x: 865, y: 475 },
    zoomBox: { x: 835, y: 450, width: 75, height: 60 },
    path: 'M 870,455 L 900,465 L 875,495 L 850,480 L 870,455 Z'
  },
  {
    uf: 'BA',
    name: 'Bahia',
    region: 'Nordeste',
    centroid: { x: 760, y: 505 },
    zoomBox: { x: 650, y: 410, width: 250, height: 220 },
    path: 'M 660,370 L 760,430 L 850,480 L 875,495 L 850,590 L 795,640 L 710,610 L 685,530 L 660,370 Z'
  },

  // ==================== CENTRO-OESTE ====================
  {
    uf: 'MT',
    name: 'Mato Grosso',
    region: 'Centro-Oeste',
    centroid: { x: 440, y: 485 },
    zoomBox: { x: 330, y: 380, width: 250, height: 230 },
    path: 'M 375,345 L 485,395 L 565,415 L 570,500 L 535,595 L 460,610 L 390,575 L 330,475 L 375,345 Z'
  },
  {
    uf: 'GO',
    name: 'Goiás',
    region: 'Centro-Oeste',
    centroid: { x: 575, y: 575 },
    zoomBox: { x: 510, y: 495, width: 170, height: 180 },
    path: 'M 570,500 L 615,505 L 675,545 L 665,630 L 585,655 L 535,595 L 570,500 Z'
  },
  {
    uf: 'DF',
    name: 'Distrito Federal',
    region: 'Centro-Oeste',
    centroid: { x: 625, y: 550 },
    zoomBox: { x: 595, y: 525, width: 65, height: 55 },
    path: 'M 618,542 L 638,540 L 636,558 L 616,556 Z'
  },
  {
    uf: 'MS',
    name: 'Mato Grosso do Sul',
    region: 'Centro-Oeste',
    centroid: { x: 475, y: 675 },
    zoomBox: { x: 395, y: 590, width: 180, height: 185 },
    path: 'M 460,610 L 535,595 L 585,655 L 545,750 L 480,765 L 430,710 L 460,610 Z'
  },

  // ==================== SUDESTE ====================
  {
    uf: 'MG',
    name: 'Minas Gerais',
    region: 'Sudeste',
    centroid: { x: 690, y: 640 },
    zoomBox: { x: 585, y: 545, width: 230, height: 210 },
    path: 'M 665,540 L 710,610 L 795,640 L 780,705 L 715,745 L 640,735 L 585,655 L 665,540 Z'
  },
  {
    uf: 'ES',
    name: 'Espírito Santo',
    region: 'Sudeste',
    centroid: { x: 790, y: 680 },
    zoomBox: { x: 750, y: 635, width: 85, height: 100 },
    path: 'M 780,640 L 815,665 L 795,725 L 765,715 L 780,640 Z'
  },
  {
    uf: 'RJ',
    name: 'Rio de Janeiro',
    region: 'Sudeste',
    centroid: { x: 740, y: 735 },
    zoomBox: { x: 685, y: 700, width: 120, height: 80 },
    path: 'M 715,715 L 785,715 L 775,755 L 695,750 L 715,715 Z'
  },
  {
    uf: 'SP',
    name: 'São Paulo',
    region: 'Sudeste',
    centroid: { x: 605, y: 730 },
    zoomBox: { x: 515, y: 665, width: 200, height: 150 },
    path: 'M 545,670 L 640,700 L 705,735 L 660,785 L 565,775 L 530,730 L 545,670 Z'
  },

  // ==================== SUL ====================
  {
    uf: 'PR',
    name: 'Paraná',
    region: 'Sul',
    centroid: { x: 550, y: 790 },
    zoomBox: { x: 475, y: 735, width: 170, height: 115 },
    path: 'M 500,755 L 585,765 L 635,785 L 610,830 L 525,820 L 485,785 L 500,755 Z'
  },
  {
    uf: 'SC',
    name: 'Santa Catarina',
    region: 'Sul',
    centroid: { x: 565, y: 840 },
    zoomBox: { x: 495, y: 800, width: 155, height: 85 },
    path: 'M 505,820 L 600,820 L 615,855 L 535,865 L 490,845 L 505,820 Z'
  },
  {
    uf: 'RS',
    name: 'Rio Grande do Sul',
    region: 'Sul',
    centroid: { x: 515, y: 885 },
    zoomBox: { x: 420, y: 830, width: 195, height: 145 },
    path: 'M 490,845 L 575,850 L 570,915 L 515,960 L 450,920 L 440,865 L 490,845 Z'
  }
];

export const REGION_NAMES = [
  { id: 'all', label: 'Brasil Inteiro', count: 27 },
  { id: 'Sudeste', label: 'Sudeste', ufs: ['SP', 'RJ', 'MG', 'ES'] },
  { id: 'Sul', label: 'Sul', ufs: ['PR', 'SC', 'RS'] },
  { id: 'Nordeste', label: 'Nordeste', ufs: ['BA', 'PE', 'CE', 'RN', 'MA', 'AL', 'SE', 'PB', 'PI'] },
  { id: 'Centro-Oeste', label: 'Centro-Oeste', ufs: ['GO', 'DF', 'MT', 'MS'] },
  { id: 'Norte', label: 'Norte', ufs: ['PA', 'AM', 'RO', 'AC', 'RR', 'AP', 'TO'] }
];
