from PIL import Image
import os

src_path = r"c:/Users/днс/Desktop/Claude AI/My projects CLAUDE CODE/Проект 2/ключ 2.png"
out_dir = r"c:/Users/днс/Desktop/Claude AI/My projects CLAUDE CODE/Проект 2/site"

img = Image.open(src_path).convert("RGBA")
print("Source size:", img.size)

# Убираем белый/почти-белый фон -> делаем прозрачным
pixels = img.load()
w, h = img.size
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        # Считаем фоном пиксели, близкие к белому
        if r > 240 and g > 240 and b > 240:
            pixels[x, y] = (r, g, b, 0)

# Обрезаем по альфа-каналу (прозрачные поля)
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)
    print("Cropped to:", img.size)

# Сохраняем 3 размера
for size in (32, 64, 128):
    resized = img.resize((size, size), Image.LANCZOS)
    out = os.path.join(out_dir, f"cursor-key-{size}.png")
    resized.save(out, "PNG")
    print("Saved:", out)

# Бонус: .cur (Windows cursor) 32x32
cur32 = img.resize((32, 32), Image.LANCZOS)
cur_path = os.path.join(out_dir, "cursor-key.cur")
cur32.save(cur_path, format="ICO", sizes=[(32, 32)])
# .ico с расширением .cur будет работать как курсор
print("Saved:", cur_path)
print("DONE")
