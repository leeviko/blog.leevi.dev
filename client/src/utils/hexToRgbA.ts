export const hexToRgbA = (hex: any, alpha = 1) => {
  if (!hex) {
    return "unset";
  }
  const [r, g, b] = hex.match(/\w\w/g).map((x: any) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};
