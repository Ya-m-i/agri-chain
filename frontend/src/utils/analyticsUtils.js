// Group claims by quarter
export function groupClaimsByQuarter(claims) {
  const grouped = {};
  claims.forEach(claim => {
    const date = new Date(claim.date);
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const key = `${year}-Q${quarter}`;
    grouped[key] = (grouped[key] || 0) + 1;
  });
  return Object.entries(grouped).map(([x, y]) => ({ x, y }));
} 