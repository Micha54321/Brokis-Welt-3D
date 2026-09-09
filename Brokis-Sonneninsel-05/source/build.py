"""Create the offline island demo without changing the game or figure study."""
from pathlib import Path
import sys
src=Path(__file__).resolve().parent
out=Path(sys.argv[1])
html=(src/'index.html').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="island.css">','<style>'+(src/'island.css').read_text(encoding='utf-8')+'</style>')
for name in ['vendor/three.js','broki-model.js','island-world.js','island-polish.js','island-coins.js','island-game.js']:
    code=(src/name).read_text(encoding='utf-8').replace('</script','<\\/script')
    html=html.replace(f'<script src="{name}"></script>','<script>\n'+code+'\n</script>')
out.parent.mkdir(exist_ok=True,parents=True)
out.write_text(html,encoding='utf-8')
print(f'{out}: {out.stat().st_size:,} bytes')
