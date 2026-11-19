export const classColors = ['#397ab9', '#c47740'] as const
export const intersectionColor = '#8258ac'

export const plotColors = {
  background: '#ffffff',
  grid: '#dfe3e8',
  axis: '#79869a',
  surface: '#7498bd',
  water: '#599ccf',
  selection: '#24364c',
}

export const plotThemeVariables = {
  '--plot-bg': plotColors.background,
  '--plot-grid': plotColors.grid,
  '--plot-axis': plotColors.axis,
  '--class-0': classColors[0],
  '--class-1': classColors[1],
  '--boundary': intersectionColor,
}
