import soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("/home/yanir_brody/kokoro-models/kokoro-v1.0.onnx", "/home/yanir_brody/kokoro-models/voices-v1.0.bin")
samples, sr = k.create("Hello, this is a test of the video and audio pipeline.", voice="af_heart", speed=1.0, lang="en-us")
sf.write("public/test-audio.wav", samples, sr)
print("written", len(samples)/sr, "seconds @", sr)
