"""Procedural textures for the site (no texture assets were supplied).
concrete.jpg  - tileable light concrete matching the poster backgrounds (#deddd8 range)
grain.png     - tileable film grain overlay
brush-*.png   - dry-brush strokes echoing the hand-painted lettering on the posters
Run: python scripts/make-textures.py
"""
import numpy as np, os
from PIL import Image, ImageFilter
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'media', 'texture')
rng = np.random.default_rng(7)

def fractal(n, beta):
    # 1/f^beta noise via FFT: periodic, so it tiles seamlessly
    fx = np.fft.fftfreq(n)[:, None]; fy = np.fft.fftfreq(n)[None, :]
    f = np.sqrt(fx**2 + fy**2); f[0, 0] = 1
    spec = (rng.normal(size=(n, n)) + 1j * rng.normal(size=(n, n))) / f**beta
    spec[0, 0] = 0
    img = np.real(np.fft.ifft2(spec))
    return (img - img.mean()) / img.std()

# Concrete
n = 1024
base = 0.55 * fractal(n, 1.1) + 0.35 * fractal(n, 1.6) + 0.25 * fractal(n, 0.6)
pits = (rng.random((n, n)) > 0.9965).astype(float)
pits = np.array(Image.fromarray((pits * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))) / 255.0
lum = 220 + base * 9 - pits * 40
r, g, b = lum + 1, lum, lum - 4
img = np.clip(np.stack([r, g, b], -1), 0, 255).astype(np.uint8)
Image.fromarray(img).save(os.path.join(OUT, 'concrete.jpg'), quality=78, optimize=True)

# Grain
m = 256
gr = rng.normal(0.5, 0.18, (m, m))
alpha = np.clip(np.abs(gr - 0.5) * 2.4, 0, 1) * 255 * 0.07  # subtle: a film texture, not static
lumg = np.where(gr > 0.5, 255, 0)
Image.fromarray(np.stack([lumg, lumg, lumg, alpha], -1).astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'grain.png'), optimize=True)

def smooth1d(n, scale, octaves=4):
    out = np.zeros(n)
    for o in range(octaves):
        k = max(2, int(n / (scale / 2**o)))
        pts = rng.normal(size=k + 2)
        x = np.linspace(0, k, n)
        out += np.interp(x, np.arange(k + 2), pts) / 2**o
    return out

def field(h, w, sy, sx, seed):
    """Anisotropic smooth noise: long correlation along x (sx px), short along y (sy px)."""
    r = np.random.default_rng(seed)
    g = r.normal(size=(max(2, int(h / sy) + 2), max(2, int(w / sx) + 2))).astype(np.float32)
    f = np.asarray(Image.fromarray(g, 'F').resize((w, h), Image.BICUBIC))
    return (f - f.mean()) / (f.std() + 1e-6)

def smoothstep(a, b, v):
    t = np.clip((v - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)

def brush(w, h, rgb, name, dryness=1.0, seed=0):
    """Dry-brush stroke. Every bristle clump carries its own ink load and runs dry
    unevenly along the stroke, so the tail breaks into ragged, fragmented streaks.
    Rendered at 2x and downsampled for clean anti-aliasing."""
    global rng
    rng = np.random.default_rng(seed)
    S = 2; W, H = w * S, h * S
    x = np.arange(W, dtype=np.float32); y = np.arange(H, dtype=np.float32)[:, None]
    t = x / W

    # centreline with a slight arc and hand wobble
    mid = H * 0.5 + H * 0.05 * np.sin(np.pi * t) * (1 if seed % 2 else -1) + smooth1d(W, W * 0.7, 2) * H * 0.02
    # pressure: quick press-in, gentle variation, long taper
    press = np.clip(t / 0.045, 0, 1) ** 0.45
    pressure = 1 + smooth1d(W, W * 0.35, 3) * 0.05
    half = H * 0.34 * press * pressure * (1 - 0.5 * t ** 2.4)
    # serrated contour: bristle tips along the edges
    top = mid - half * (1 + 0.04 * smooth1d(W, 90, 3)) - np.abs(smooth1d(W, 14, 2)) * H * 0.012
    bot = mid + half * (1 + 0.04 * smooth1d(W, 90, 3)) + np.abs(smooth1d(W, 14, 2)) * H * 0.012
    edge = np.minimum(y - top, bot - y)
    inside = smoothstep(-1.5, 1.5, edge)

    v = np.clip((y - mid) / np.maximum(half, 1), -1.4, 1.4)
    clump = field(H, 1, 5, 1, seed + 1)[:, :1] * 0.6 + field(H, 1, 2, 1, seed + 2)[:, :1] * 0.4
    along = field(H, W, 5, 340, seed + 3) * 0.6 + field(H, W, 2.5, 90, seed + 4) * 0.4
    ink = (1.55 + 0.6 * clump + 0.45 * along
           - dryness * 2.7 * t ** 1.7          # load runs out toward the tail
           - 1.3 * np.abs(v) ** 3 * t ** 0.8)  # edge bristles dry first
    alpha = smoothstep(-0.1, 0.1, ink) * inside
    # slight density variation inside the wet part reads as paint, not a vector fill
    alpha *= 0.9 + 0.1 * smoothstep(0, 1.2, ink)

    # spatter flung off the press point and the edges
    spat = np.zeros((H, W), np.float32)
    for _ in range(int(38 * dryness)):
        cx = int(abs(rng.normal(0, 0.18)) * W)
        side = rng.choice([-1, 1])
        cy = int(mid[min(cx, W - 1)] + side * (half[min(cx, W - 1)] + abs(rng.normal(0, 0.09)) * H))
        cx, cy = int(np.clip(cx, 12, W - 12)), int(np.clip(cy, 12, H - 12))
        r = rng.uniform(1.2, 4.5) * S
        win = (slice(cy - 12, cy + 12), slice(cx - 12, cx + 12))
        yy, xx = np.ogrid[cy - 12:cy + 12, cx - 12:cx + 12]
        d = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)
        spat[win] = np.maximum(spat[win], smoothstep(r, r - 1.5, d))
    alpha = np.clip(np.maximum(alpha, spat), 0, 1)

    pool = 1 - 0.16 * smoothstep(0.8, 2.0, ink)   # ink pools darker where it is heaviest
    rgba = np.zeros((H, W, 4), np.uint8)
    for i, c in enumerate(rgb):
        rgba[..., i] = np.clip(c * pool, 0, 255)
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').resize((w, h), Image.LANCZOS).save(os.path.join(OUT, name), optimize=True)

brush(1800, 360, (216, 19, 27), 'brush-red.png', 1.0, 3)
brush(1800, 300, (0, 0, 0), 'brush-black.png', 1.1, 11)
brush(1400, 220, (214, 162, 60), 'brush-gold.png', 1.2, 21)
print('textures written')
