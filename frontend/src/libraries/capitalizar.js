/**
 * @param {string} string 
 */
export default function capitalizar(string) {
  return String(string.replace(/_/g, " ")).replace(/(^\w{1})|(\s+\w{1})|_/g, letter => letter.toUpperCase());
};