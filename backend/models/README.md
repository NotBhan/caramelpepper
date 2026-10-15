# CaramelPepper Local Models Directory

Place your `.gguf` quantized models in this directory for local offline inference (Zero-Egress Mode).

### Supported Format:
- Files ending in `.gguf`
- Examples:
  - `qwen2.5-coder-1.5b-instruct-q4_k_m.gguf`
  - `deepseek-coder-6.7b.gguf`
  - `llama-3.2-3b-instruct-q8_0.gguf`

CaramelPepper will automatically scan this directory, parse quantization parameters, estimate required RAM/VRAM, and enable real-time hot-swapping without restarting the backend.
