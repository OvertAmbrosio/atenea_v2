export default function capitalizar(s: string):string {
  if (typeof s !== 'string') return '';
  return (String(s).toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()));
};