export function snakeCaseToTitleCase(snakeCase: string) {
  if (snakeCase.includes('_')) {
    return snakeCase.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  } 

  else { return snakeCase; }
}

export function dashCaseToTitleCase(dashCase: string) {
  if (dashCase.includes('-')) {
    return dashCase.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  } 

  else { return dashCase; }
}

