export var delay = (f, d, a) => setTimeout(f, d || 0, a);

export var nextFrame = (f) => requestAnimationFrame(f);
