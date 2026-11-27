import sys, glob, os
from PIL import Image
# 2160 x 2700 (png) -> 1080 x 1350 (jpg) + visão geral
d = sys.argv[1]
ims = []
for f in sorted(glob.glob(os.path.join(d, 'out', 'snts-dezembro-*.png'))):
    im = Image.open(f).convert('RGB')
    if im.width == 2160:
        im = im.resize((1080, 1350), Image.LANCZOS)
    im.save(f[:-4] + '.jpg', quality=93, optimize=True)
    ims.append(im)
if len(ims) == 5:
    W, H, g = 432, 540, 16
    vg = Image.new('RGB', (W * 5 + g * 6, H + g * 2), '#f3ebe1')
    for i, im in enumerate(ims):
        vg.paste(im.resize((W, H), Image.LANCZOS), (g + i * (W + g), g))
    vg.save(os.path.join(d, 'out', 'visao-geral.jpg'), quality=90)
print(len(ims), 'laminas')
