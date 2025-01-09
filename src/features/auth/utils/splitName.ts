export const splitName = (
  name: string,
): { firstName: string; lastName: string } => {
  const lastSpace = name.lastIndexOf(' ');
  const firstName = name.substring(0, lastSpace);
  const lastName = name.slice(lastSpace + 1);
  return { firstName, lastName };
};
