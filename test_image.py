from PIL import Image
import numpy as np
img = Image.fromarray(np.zeros((128, 128, 3), dtype=np.uint8))
img.save("dummy.jpg")
