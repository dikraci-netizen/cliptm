/**
 * Professional Theme System for Planner Generator
 * Beautiful color schemes and styling for sellable planners
 */

export const themes = {
  minimalist: {
    name: 'Minimalist',
    primary: '#2C3E50',
    secondary: '#7F8C8D',
    accent: '#E74C3C',
    background: '#FFFFFF',
    lightBg: '#F8F9FA',
    border: '#DEE2E6',
    text: '#2C3E50',
    lightText: '#6C757D',
    headerFont: 'Helvetica-Bold',
    bodyFont: 'Helvetica',
    lineColor: '#E9ECEF'
  },
  elegant: {
    name: 'Elegant',
    primary: '#1A1A2E',
    secondary: '#16213E',
    accent: '#C9A96E',
    background: '#FFFFFF',
    lightBg: '#FDF8F0',
    border: '#E8DCC8',
    text: '#1A1A2E',
    lightText: '#6B5B4E',
    headerFont: 'Times-Bold',
    bodyFont: 'Times-Roman',
    lineColor: '#E8DCC8'
  },
  modern: {
    name: 'Modern',
    primary: '#6C63FF',
    secondary: '#3F3D56',
    accent: '#FF6584',
    background: '#FFFFFF',
    lightBg: '#F0EEFF',
    border: '#D4D1F7',
    text: '#3F3D56',
    lightText: '#6E6B8A',
    headerFont: 'Helvetica-Bold',
    bodyFont: 'Helvetica',
    lineColor: '#E8E6F7'
  },
  nature: {
    name: 'Nature',
    primary: '#2D5016',
    secondary: '#4A7C28',
    accent: '#8BC34A',
    background: '#FFFFFF',
    lightBg: '#F1F8E9',
    border: '#C5E1A5',
    text: '#2D5016',
    lightText: '#558B2F',
    headerFont: 'Helvetica-Bold',
    bodyFont: 'Helvetica',
    lineColor: '#DCEDC8'
  },
  pastel: {
    name: 'Pastel',
    primary: '#B39DDB',
    secondary: '#F48FB1',
    accent: '#80DEEA',
    background: '#FFFFFF',
    lightBg: '#FFF3E0',
    border: '#F8BBD9',
    text: '#4A148C',
    lightText: '#7B1FA2',
    headerFont: 'Helvetica-Bold',
    bodyFont: 'Helvetica',
    lineColor: '#F3E5F5'
  },
  corporate: {
    name: 'Corporate',
    primary: '#1565C0',
    secondary: '#0D47A1',
    accent: '#FF8F00',
    background: '#FFFFFF',
    lightBg: '#E3F2FD',
    border: '#90CAF9',
    text: '#0D47A1',
    lightText: '#1976D2',
    headerFont: 'Helvetica-Bold',
    bodyFont: 'Helvetica',
    lineColor: '#BBDEFB'
  },
  boho: {
    name: 'Boho',
    primary: '#BF360C',
    secondary: '#D84315',
    accent: '#FFB74D',
    background: '#FFFFFF',
    lightBg: '#FFF8E1',
    border: '#FFCC80',
    text: '#3E2723',
    lightText: '#5D4037',
    headerFont: 'Times-Bold',
    bodyFont: 'Times-Roman',
    lineColor: '#FFE0B2'
  },
  monochrome: {
    name: 'Monochrome',
    primary: '#212121',
    secondary: '#424242',
    accent: '#757575',
    background: '#FFFFFF',
    lightBg: '#FAFAFA',
    border: '#E0E0E0',
    text: '#212121',
    lightText: '#616161',
    headerFont: 'Helvetica-Bold',
    bodyFont: 'Helvetica',
    lineColor: '#EEEEEE'
  }
};

export const paperSizes = {
  letter: { width: 612, height: 792, name: 'US Letter (8.5x11)' },
  a4: { width: 595.28, height: 841.89, name: 'A4' },
  a5: { width: 419.53, height: 595.28, name: 'A5' },
  half_letter: { width: 396, height: 612, name: 'Half Letter (5.5x8.5)' }
};

export function getTheme(themeName) {
  return themes[themeName] || themes.minimalist;
}

export function getPageSize(sizeName) {
  return paperSizes[sizeName] || paperSizes.letter;
}
