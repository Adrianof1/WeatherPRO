// Pontos de alagamento conhecidos (dados aproximados/históricos — não são oficiais).
export const FLOOD_DATABASE = {
  'Teresina': {
    riskLevel: 'alto',
    points: [
      { name: 'Av. Raul Lopes (Marginal Rio Poti)', risk: 'crítico', lat: -5.0578, lon: -42.7780, desc: 'Área de inundação frequente do Rio Poti' },
      { name: 'Bairro Poti Velho', risk: 'crítico', lat: -5.0650, lon: -42.7920, desc: 'Zona ribeirinha — risco alto em chuvas fortes' },
      { name: 'Av. Maranhão (Centro)', risk: 'alto', lat: -5.0892, lon: -42.8019, desc: 'Alagamento por drenagem insuficiente' },
      { name: 'Bairro Buenos Aires', risk: 'alto', lat: -5.0715, lon: -42.7865, desc: 'Área baixa próxima ao Rio Parnaíba' },
      { name: 'Av. Miguel Rosa', risk: 'médio', lat: -5.0835, lon: -42.7980, desc: 'Acúmulo de água em chuvas moderadas' },
      { name: 'Bairro Santa Maria da Codipi', risk: 'crítico', lat: -5.0210, lon: -42.8150, desc: 'Região alagável — risco de enchente' },
    ]
  },
  'São Paulo': {
    riskLevel: 'crítico',
    points: [
      { name: 'Marginal Tietê', risk: 'crítico', lat: -23.5190, lon: -46.6880, desc: 'Alagamentos frequentes em temporais' },
      { name: 'Marginal Pinheiros', risk: 'crítico', lat: -23.5870, lon: -46.6920, desc: 'Transbordamento do Rio Pinheiros' },
      { name: 'Praça da Sé (Centro)', risk: 'alto', lat: -23.5505, lon: -46.6340, desc: 'Drenagem insuficiente — acúmulo rápido' },
      { name: 'Av. do Estado', risk: 'crítico', lat: -23.5450, lon: -46.6280, desc: 'Zona de várzea do Rio Tamanduateí' },
      { name: 'Bairro Ipiranga', risk: 'alto', lat: -23.5887, lon: -46.6095, desc: 'Córrego Ipiranga — transbordamento' },
      { name: 'Vila Prudente', risk: 'alto', lat: -23.5842, lon: -46.5810, desc: 'Região baixa com alagamento recorrente' },
      { name: 'Itaquera', risk: 'médio', lat: -23.5420, lon: -46.4575, desc: 'Pontos isolados de alagamento' },
    ]
  },
  'Rio de Janeiro': {
    riskLevel: 'crítico',
    points: [
      { name: 'Praça da Bandeira', risk: 'crítico', lat: -22.9120, lon: -43.1920, desc: 'Ponto mais crítico — Rio Maracanã' },
      { name: 'Jardim Botânico', risk: 'alto', lat: -22.9671, lon: -43.2240, desc: 'Encosta + acúmulo de água pluvial' },
      { name: 'Tijuca', risk: 'alto', lat: -22.9320, lon: -43.2420, desc: 'Deslizamentos + alagamentos' },
      { name: 'Barra da Tijuca (Av. Ayrton Senna)', risk: 'alto', lat: -22.9830, lon: -43.3650, desc: 'Drenagem precária em chuvas fortes' },
      { name: 'Centro (Av. Presidente Vargas)', risk: 'alto', lat: -22.9040, lon: -43.1780, desc: 'Alagamento rápido em temporais' },
      { name: 'Rocinha / São Conrado', risk: 'crítico', lat: -22.9870, lon: -43.2490, desc: 'Risco de deslizamento de terra' },
    ]
  },
  'Recife': {
    riskLevel: 'crítico',
    points: [
      { name: 'Bairro da Várzea', risk: 'crítico', lat: -8.0420, lon: -34.9450, desc: 'Inundação do Rio Capibaribe' },
      { name: 'Boa Viagem (orla)', risk: 'alto', lat: -8.1190, lon: -34.8950, desc: 'Ressaca e acúmulo pluvial' },
      { name: 'Derby / Aflitos', risk: 'alto', lat: -8.0530, lon: -34.8990, desc: 'Alagamento urbano frequente' },
      { name: 'Dois Irmãos', risk: 'crítico', lat: -8.0110, lon: -34.9470, desc: 'Deslizamento em encostas' },
    ]
  },
  'Salvador': {
    riskLevel: 'alto',
    points: [
      { name: 'Bairro da Paz', risk: 'alto', lat: -12.9360, lon: -38.3830, desc: 'Encosta com risco de deslizamento' },
      { name: 'Av. Suburbana', risk: 'crítico', lat: -12.9240, lon: -38.4960, desc: 'Maré alta + chuvas = alagamento' },
      { name: 'Ondina / Rio Vermelho', risk: 'médio', lat: -13.0090, lon: -38.5090, desc: 'Acúmulo em vias baixas' },
    ]
  },
  'Belo Horizonte': {
    riskLevel: 'alto',
    points: [
      { name: 'Av. Vilarinho (Venda Nova)', risk: 'crítico', lat: -19.8160, lon: -43.9670, desc: 'Ponto de alagamento grave' },
      { name: 'Av. Tereza Cristina', risk: 'crítico', lat: -19.9360, lon: -43.9740, desc: 'Ribeirão Arrudas — transbordamento' },
      { name: 'Barreiro', risk: 'alto', lat: -19.9730, lon: -44.0250, desc: 'Região baixa com alagamento' },
    ]
  },
  'Manaus': {
    riskLevel: 'alto',
    points: [
      { name: 'Bairro São Jorge', risk: 'alto', lat: -3.0930, lon: -60.0350, desc: 'Área alagável em cheia dos rios' },
      { name: 'Compensa', risk: 'crítico', lat: -3.1150, lon: -60.0580, desc: 'Risco de inundação do Rio Negro' },
      { name: 'Centro (Manaus Moderna)', risk: 'alto', lat: -3.1420, lon: -60.0240, desc: 'Porto — nível do rio variável' },
    ]
  },
  'Fortaleza': {
    riskLevel: 'médio',
    points: [
      { name: 'Bairro Carlito Pamplona', risk: 'alto', lat: -3.7230, lon: -38.5480, desc: 'Área baixa com alagamento' },
      { name: 'Av. Bezerra de Menezes', risk: 'alto', lat: -3.7380, lon: -38.5600, desc: 'Drenagem insuficiente' },
    ]
  },
};
