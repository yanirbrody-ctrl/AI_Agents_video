# Video Pipeline Setup Report

Working copy (where installs/render ran): WSL Ubuntu, `~/remotion-test`. Source files, `public/test-audio.wav`, and `output.mp4` were copied back into this folder (without `node_modules`).

## 1. Dependency checklist
- [x] ffmpeg / ffprobe 6.1.1 (apt)
- [x] Node.js v18.19.1 (preinstalled in WSL), npm 9.2.0 (apt)
- [x] Browser libs for Remotion/Chrome: libnss3, libdbus-1-3, libatk1.0-0, libatk-bridge2.0-0, libcups2, libdrm2, libxkbcommon0, libxcomposite1, libxdamage1, libxfixes3, libxrandr2, libgbm1, libasound2t64, libxss1, libgtk-3-0
- [x] python3-venv, python3-pip, unzip (apt)
- [x] Remotion 4.0.250 (`remotion`, `@remotion/cli`), React 18.3.1, TypeScript 5.5.4
- [x] kokoro-onnx 0.6.1, onnxruntime 1.32.0, soundfile 0.14.0 (Python venv `~/kokoro-venv`)
- [x] Kokoro model files: `kokoro-v1.0.onnx` (~325 MB), `voices-v1.0.bin` (~28 MB) in `~/kokoro-models`
- [x] Remotion agent skills (`npx skills add remotion-dev/skills`), installed in this folder under `.agents/` and `.claude/`

## 2. Commands
Audio (voice `af_heart`, see `generate_audio.py`):
```
~/kokoro-venv/bin/python generate_audio.py     # writes public/test-audio.wav
```
Render (composition `TestClip`, 30 fps x 5 s = 150 frames, 1280x720):
```
npx remotion render src/index.ts TestClip output.mp4
```
Verify:
```
ffprobe -v error -show_entries format=duration,size:stream=codec_type,codec_name,width,height -of default=nw=1 output.mp4
```

## 3. Verification
| Item | Result |
|---|---|
| `output.mp4` size | 239,714 bytes (~240 kB) |
| Duration | 5.056 s |
| Video | H.264, 1280x720 |
| Audio | AAC |
| `test-audio.wav` | 3.22 s, 24 kHz, 154,668 bytes; plays inside the 5 s clip |

## 4. Issues and resolutions
- **`sudo` needed a password** in WSL, and the agent cannot answer the prompt (commands hung). Resolved, with the user's approval, by running the apt install via `wsl -u root`.
- **`npx skills add` failed on Node 18** (requires Node >= 22.20). Installing Node 22 via the nvm `curl | bash` script was blocked by the permission classifier, so I ran the skills command with the Windows Node 24 instead, in this Windows folder. Skills are therefore installed here, not in the WSL copy.
- **Model size differs from the brief:** the current Kokoro v1.0 files total ~353 MB, not ~120 MB.
- **Remotion scaffolded manually** rather than via the interactive `create-video` wizard, to keep the run non-interactive.
- Audio is 3.2 s of a 5 s clip, so the last ~1.8 s is silent by design.
