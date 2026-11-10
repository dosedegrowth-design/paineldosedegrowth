import sys, glob
from PIL import Image
for f in glob.glob(sys.argv[1] + '/out/*/*.png'):
    im = Image.open(f)
    if im.width == 2160: im.resize((1080, 1350), Image.LANCZOS).save(f)
