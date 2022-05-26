export default function lerpColor(pFrom: number, pTo: number, pRatio: number) {
  const ar = (pFrom & 0xff0000) >> 16,
    ag = (pFrom & 0x00ff00) >> 8,
    ab = pFrom & 0x0000ff,
    br = (pTo & 0xff0000) >> 16,
    bg = (pTo & 0x00ff00) >> 8,
    bb = pTo & 0x0000ff,
    rr = ar + pRatio * (br - ar),
    rg = ag + pRatio * (bg - ag),
    rb = ab + pRatio * (bb - ab);

  return '#' + ((rr << 16) + (rg << 8) + (rb | 0)).toString(16);
}
