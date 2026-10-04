# Whisper NPU 
Brings speech-to-text to any app at cursor via global hotkey.

- Converts spoken words to text and puts that text at your current keyboard's cursor location.
- Runs completely locally.
- Keeps your GPU and CPU free by using Intel's NPU for running Speech to text conversion.

# How to install
1. Download the latest release from here: https://github.com/anubhavgupta/whisper-npu/releases/download/V1.0.1/whisper-npu.zip
2. Extract the zip
3. Start the whisper-npu.exe. (this auto downloads and uses the whisper-small model for you, model can be changed later)

# How to use
1. Hold `Win + /` to start capturing audio.
2. Speak while holding the shortcut.
3. Release `/` or the Windows key to stop and transcribe.
4. The app inserts the transcription into the currently focused application. Shortcuts pressed while transcription or insertion is in progress are ignored.

The keyboard hook observes global key events; unlike the previous library, it does not suppress the shortcut from reaching Windows or the focused application.


**Please check Troubleshooting section in case if you face any issue**

## Configuration

Edit `config.json` to configure your setup:

```json
{
  "sourceModel": "anubhav200/openai-whisper-tiny-openvino-int4", // check list of supported models below
  "modelRepositoryPath": "./downloaded-whisper-npu-models", // directory where models would be downloaded and stored
  "restPort": 8000, // port on which transciption server would run.
  "temperature": "0", // 0 to 1, can be adjusted to improve accuracy
  "language": "en", // set this to your speaking lang, this again will help improve accuracy
  "ovmsDirectoryPath": "./external/ovms",
  "soxDirectoryPath": "./external/sox/bin",
  "task": "speech2text",
  "targetDevice": "NPU", // models support NPU only at the moment
  "pasteMethod": "auto",
  "clipboardRestoreDelayMs": 500
}
```
### Text insertion

`pasteMethod` defaults to `auto`:

| Value | Behavior |
| --- | --- |
| `auto` | Ctrl+Shift+V in Windows Terminal (including WSL); Shift+Insert in classic console windows; Ctrl+V elsewhere. |
| `ctrl-v` | Always send Ctrl+V. |
| `ctrl-shift-v` | Always send Ctrl+Shift+V. |
| `shift-insert` | Always send Shift+Insert. |
| `direct` | Type Unicode text without accessing the clipboard. Line breaks and tabs become spaces; other control characters are omitted. |

Use an explicit method for customized shortcuts or embedded terminals (such as VS Code), which cannot reliably be distinguished from their host editor by foreground process alone. Direct mode avoids keyboard-layout character mapping, but applications must support Windows Unicode input; automatic clipboard paste remains the recommended terminal default. No mode appends Enter or submits your text. Clipboard mode preserves existing line breaks, so terminal-specific multiline paste behavior still applies.

Clipboard paste saves existing formats (including text, HTML/RTF, images, and file lists) in memory and restores them after `clipboardRestoreDelayMs` (default 500; range 0–30000). Increase the delay if a slow application pastes your old clipboard contents. If you copy something else meanwhile, your newer clipboard contents take precedence. Unknown formats that cannot be preserved cause insertion to abort before overwriting the clipboard; use direct mode in that case. Clipboard history is not managed, and a forced process termination can prevent restoration.

Keep the target application focused during insertion. The helper waits up to five seconds for modifier keys to be released and stops if focus changes. Input failures are reported without automatically trying another method, which could duplicate partially inserted text. The transcription stays visible in the console. An elevated/admin application requires the dictation app to have matching privileges.

# Supported Models for NPU:
Following models are support to run on NPU, I will add more models soon. Change the value of `sourceModel` in config file to one of the following:

- `anubhav200/openai-whisper-tiny-openvino-int4`
- `anubhav200/openai-whisper-small-openvino-int4`
- `anubhav200/openai-whisper-large-v3-turbo-openvino-int4` (takes very long time to start)


## Manual Build from source

## Requirements

- **Node.js** (v24 or higher)
- **Windows** (for Windows Forms clipboard integration)
- **Machine with Intel NPU**

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Executable

```bash
npm run release
```
This generates `./pack/whisper-npu.zip` for Windows x64. Extract the entire ZIP and run `whisper-npu.exe` from that directory. Keep the included `windows/` helper directory beside the executable; it uses Windows PowerShell 5.1 and .NET Framework. The release includes the Windows native keyboard-hook binary.


## Development

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

## Troubleshooting

1. Make sure you have installed the latest Intel's NPU drivers by following the guide here: https://www.intel.com/content/www/us/en/support/articles/000099083/processors/intel-core-ultra-processors.html

## License

MPL 2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Validation

- `npm test`: builds TypeScript and tests shortcut handling, quick releases, repeated keys, startup/shutdown failures, serialization, and configuration.
- `npm run test:windows`: on a Windows desktop, compiles the insertion helper and tests shortcut selection and clipboard restoration, including rich text, images, file lists, and a newer clipboard copy. Temporarily exercises the clipboard and restores its original contents; do not copy other content during this test.
- Manual Windows release check: test hold/release in both orders, quick taps, a long hold, and Ctrl+C shutdown. Dictate into Notepad and Windows Terminal running WSL/CLI tools; verify exactly one insertion and restored clipboard. Repeat with `pasteMethod: "direct"`, Unicode/emoji, and quotes. Check focus changes, modifier keys held during insertion, and custom shortcut overrides. Repeat using the extracted release ZIP, not only `npm start`.

Linux builds and unit tests do not verify Windows keyboard hooks, clipboard APIs, native-module loading, or actual input delivery.
