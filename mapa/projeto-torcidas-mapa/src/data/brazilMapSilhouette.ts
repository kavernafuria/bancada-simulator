// Precise SVG path for Brazil's silhouette matching the clean, iconic reference styling (1477996.png)
// Calibrated for a 1000x1000 coordinate space

export const BRAZIL_OUTLINE_PATH = `
  M 30,290
  C 33,266 37,271 55,260
  C 73,249 98,266 110,240
  C 122,214 108,164 110,140
  C 112,116 111,134 120,130
  C 129,126 137,119 150,120
  C 163,121 167,134 180,135
  C 193,136 197,132 210,125
  C 223,118 228,106 240,105
  C 252,104 250,127 265,120
  C 280,113 294,79 310,75
  C 327,71 325,100 340,100
  C 355,100 358,73 380,75
  C 402,77 420,107 440,110
  C 460,113 450,94 470,90
  C 490,86 506,86 530,90
  C 554,94 558,96 580,110
  C 602,124 619,145 630,155
  C 641,165 660,178 680,190
  C 700,202 710,206 730,215
  C 750,224 750,223 770,225
  C 790,227 805,218 840,230
  C 875,242 900,256 930,280
  C 960,304 971,316 975,340
  C 979,364 962,368 950,390
  C 938,412 927,429 920,440
  C 913,451 905,465 890,490
  C 875,515 873,509 860,540
  C 847,571 845,593 830,630
  C 815,667 812,684 790,710
  C 768,736 756,737 730,750
  C 704,763 694,757 670,770
  C 646,783 641,788 620,810
  C 599,832 585,857 575,870
  C 565,883 555,897 540,920
  C 525,943 514,977 490,970
  C 466,963 441,921 430,890
  C 419,859 438,859 440,830
  C 442,801 447,786 440,760
  C 433,734 423,736 410,710
  C 397,684 391,669 380,640
  C 369,611 369,606 360,580
  C 351,554 358,544 340,520
  C 322,496 306,492 280,470
  C 254,448 244,427 220,420
  C 196,413 190,438 170,440
  C 150,442 150,432 130,430
  C 110,428 100,443 80,430
  C 60,417 49,383 40,370
  C 31,357 27,314 30,290
  Z
`;

// Iconic Broken / Dashed Stroke Segments directly matching reference icon 1477996.png
export const BRAZIL_ICON_STROKE_SEGMENTS = [
  // Segment 1: Acre -> Amazonas -> Roraima -> Amapá
  `M 40,370 C 38,352 27,314 30,290 C 33,266 37,271 55,260 C 73,249 98,266 110,240 C 122,214 108,164 110,140 C 112,116 111,134 120,130 C 129,126 137,119 150,120 C 163,121 167,134 180,135 C 193,136 197,132 210,125 C 223,118 228,106 240,105 C 252,104 250,127 265,120 C 280,113 294,79 310,75 C 327,71 325,100 340,100 C 355,100 358,73 380,75 C 402,77 420,107 440,110 C 460,113 450,94 470,90 C 490,86 506,86 530,90 C 554,94 558,96 580,110 C 602,124 619,145 630,155`,
  // Segment 2: Floating dash on North Coast
  `M 675,188 C 687,195 716,211 728,218`,
  // Segment 3: Northeast Horn (Maranhão / Ceará / RN / PB / PE / AL)
  `M 770,225 C 785,226 805,218 840,230 C 875,242 900,256 930,280 C 960,304 971,316 975,340 C 979,364 962,368 950,390 C 938,412 927,429 920,440`,
  // Segment 4: East Coast & Southeast (Bahia / ES / RJ / SP / PR / SC)
  `M 890,490 C 883,501 873,509 860,540 C 847,571 845,593 830,630 C 815,667 812,684 790,710 C 768,736 756,737 730,750 C 704,763 694,757 670,770 C 646,783 641,788 620,810 C 599,832 585,857 575,870`,
  // Segment 5: South & Western Inland Border (RS Chuí -> MS -> MT -> RO -> AC)
  `M 540,920 C 529,931 514,977 490,970 C 466,963 441,921 430,890 C 419,859 438,859 440,830 C 442,801 447,786 440,760 C 433,734 423,736 410,710 C 397,684 391,669 380,640 C 369,611 369,606 360,580 C 351,554 358,544 340,520 C 322,496 306,492 280,470 C 254,448 244,427 220,420 C 196,413 190,438 170,440 C 150,442 150,432 130,430 C 110,428 100,443 80,430 C 60,417 49,383 40,370`
];

// Calibrated geographic coordinates for all 44 cities in Brazil where torcidas are based
// Guaranteed to be strictly inside the Brazil silhouette with realistic geographic accuracy at all zoom levels
export const CITY_COORDINATES: Record<string, { x: number; y: number }> = {
  // SP Capital & Região Metropolitana
  'São Paulo, SP': { x: 622, y: 728 },
  'Santos, SP': { x: 636, y: 742 },
  'Santo André, SP': { x: 630, y: 734 },
  'São Bernardo do Campo, SP': { x: 626, y: 736 },
  'São Caetano do Sul, SP': { x: 624, y: 730 },
  'Diadema/SP, SP': { x: 622, y: 734 },
  // SP Interior & Vale do Paraíba
  'Campinas, SP': { x: 608, y: 712 },
  'Jundiaí, SP': { x: 614, y: 718 },
  'Americana, SP': { x: 602, y: 706 },
  'Santa Bárbara d\'Oeste, SP': { x: 598, y: 704 },
  'Limeira, SP': { x: 596, y: 698 },
  'Piracicaba, SP': { x: 590, y: 702 },
  'Bauru, SP': { x: 565, y: 708 },
  'Araraquara, SP': { x: 588, y: 686 },
  'Ribeirão Preto, SP': { x: 598, y: 672 },
  'São José dos Campos, SP': { x: 648, y: 722 },
  'Taubaté, SP': { x: 660, y: 718 },
  // RJ
  'Rio de Janeiro, RJ': { x: 726, y: 732 },
  // MG
  'Belo Horizonte, MG': { x: 692, y: 638 },
  // Sul
  'Curitiba, PR': { x: 574, y: 788 },
  'Londrina, PR': { x: 546, y: 764 },
  'Florianópolis, SC': { x: 580, y: 836 },
  'Criciúma, SC': { x: 562, y: 852 },
  'Chapecó, SC': { x: 522, y: 824 },
  'Caxias do Sul, RS': { x: 536, y: 874 },
  'Porto Alegre, RS': { x: 526, y: 894 },
  'Pelotas, RS': { x: 508, y: 924 },
  // Centro-Oeste
  'Goiânia, GO': { x: 576, y: 576 },
  'Brasília/Gama, DF': { x: 624, y: 554 },
  'Brasília/Taguatinga, DF': { x: 620, y: 546 },
  'Cuiabá, MT': { x: 442, y: 486 },
  'Campo Grande, MS': { x: 476, y: 674 },
  // Nordeste
  'Salvador, BA': { x: 806, y: 532 },
  'Aracaju, SE': { x: 844, y: 476 },
  'Maceió, AL': { x: 864, y: 442 },
  'Recife, PE': { x: 872, y: 406 },
  'João Pessoa, PB': { x: 888, y: 364 },
  'Campina Grande, PB': { x: 872, y: 366 },
  'Natal, RN': { x: 882, y: 326 },
  'Fortaleza, CE': { x: 830, y: 288 },
  'São Luís, MA': { x: 698, y: 276 },
  // Norte
  'Belém, PA': { x: 588, y: 212 },
  'Manaus, AM': { x: 336, y: 254 },
  'Rio Branco, AC': { x: 142, y: 382 }
};

// Regional accents and helpers
export const BRAZIL_REGIONS_DATA = [
  { id: 'all', name: 'Brasil Completo', count: 27 },
  { id: 'Sudeste', name: 'Sudeste', ufs: ['SP', 'RJ', 'MG', 'ES'] },
  { id: 'Sul', name: 'Sul', ufs: ['PR', 'SC', 'RS'] },
  { id: 'Nordeste', name: 'Nordeste', ufs: ['BA', 'PE', 'CE', 'RN', 'MA', 'AL', 'SE', 'PB', 'PI'] },
  { id: 'Centro-Oeste', name: 'Centro-Oeste', ufs: ['GO', 'DF', 'MT', 'MS'] },
  { id: 'Norte', name: 'Norte', ufs: ['PA', 'AM', 'RO', 'AC', 'RR', 'AP', 'TO'] }
];

