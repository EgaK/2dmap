export const delay = (f, d, a) => setTimeout(f, d || 0, a);

export const nextFrame = (f) => requestAnimationFrame(f);
