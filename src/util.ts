export function snakeCaseToTitleCase(snakeCase: string) {
  return snakeCase.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

