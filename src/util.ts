export function snakeCaseToTitleCase(snakeCase: string) {
  if (snakeCase.includes('_')) {
    return snakeCase.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  } 

  else { return (snakeCase.charAt(0).toUpperCase() + snakeCase.slice(1)); }
}

export function dashCaseToTitleCase(dashCase: string) {
  if (dashCase.includes('-')) {
    return dashCase.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  } 

  else { return dashCase; }
}

export function getNthOccurrence(str: string, char: string, n: number) {
  let index = -1;

  for (let i = 0; i < n; i++) {
    index = str.indexOf(char, index + 1);
    if (index === -1) {
      return -1; // Character doesn't occur n times
    }
  }

  return index;
}
