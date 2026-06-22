# AI Typing Simulator

Simulate organic, human-like typing flows in VS Code directly from AI-generated scripts. Perfect for video tutorials, screencasts, coding presentations, live-coding demos, or testing trace verifiers.

## Features

* **Organic Typing Jitter**: Adds natural character speed variance and human-like jitter.
* **Thinking Pauses**: Automatically pauses briefly at word boundaries (spaces), punctuation marks (commas, semicolons, periods), and after newlines to emulate human thinking.
* **Typo Corrections**: Supports simulating typos and backspacing corrections.
* **Cursor Jumps**: Simulates navigation through absolute or relative line/character jumps.
* **IDE Auto-Closing & Pairs Simulation**: Works with brackets (`{}`, `[]`, `()`, `<>`) and quotes (`""`) typed closed-first.
* **Flexible Input Sources**: Load simulation scripts directly from your clipboard or select a JSON file from disk.
* **Graceful Cancellation**: Stop the simulation at any point using the stop command.

---

## Extension Commands

The extension contributes the following commands to the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

* **AI Typing Simulator: Run Simulation Script** (`ai-typing-simulator.runScript`): Opens a prompt to choose script source (Clipboard or JSON File) and begins typing simulation in the active editor.
* **AI Typing Simulator: Stop Simulation** (`ai-typing-simulator.stopScript`): Immediately aborts any running simulation.

---

## Action Script Format

The simulation script must be a JSON array containing action objects. 

### Action Schema

#### 1. Write Action
Types out a string of characters at the current cursor position with realistic jitter.
```json
{
  "type": "write",
  "text": "fn main() {\n    println!(\"Hello World!\");\n}",
  "speed": 2
}
```
* `text` (string, required): The text to type.
* `speed` (string | number, optional): Delays between characters. Can be `"fast"` (25ms), `"slow"` (120ms), or a specific number in milliseconds (e.g., `2`).

#### 2. Move Action
Moves the cursor to a specific position. Line and character coordinates can be absolute or relative offsets.
```json
{
  "type": "move",
  "line": 15,
  "character": 4
}
```
```json
{
  "type": "move",
  "line": "-2",
  "character": "+4"
}
```
* `line` (number | string, required): Target line index (0-indexed absolute number, or string offset like `"+2"` or `"-1"`).
* `character` (number | string, required): Target character index (0-indexed absolute number, or string offset like `"+4"` or `"-4"`).

#### 3. Wait Action
Pauses execution for a specified duration.
```json
{
  "type": "wait",
  "delay": 500
}
```
* `delay` (number, required): Time to wait in milliseconds.

#### 4. Backspace Action
Deletes characters behind the cursor.
```json
{
  "type": "backspace",
  "count": 5
}
```
* `count` (number, optional): Number of characters to delete. Defaults to `1`.

---

## Generating Scripts using AI

The most powerful way to use this extension is to instruct an AI model (like ChatGPT, Claude, or Gemini) to generate the JSON script from a target file. 

### Recommended Prompt for AI

Copy and paste the following prompt template when asking an AI to create a script for your code:

```
You are a programmatic typing simulator script generator. Generate a JSON array of editor actions (`write`, `move`, `wait`, `backspace`) that simulates a human programmer typing out the target file. When executed sequentially, the actions MUST reconstruct the target source code EXACTLY, character-for-character (including all exact whitespaces, blank lines, and brackets).

Target Source Code:
[Paste your code here]

Rules for Human-like Typing:
1. Skeleton-First: Start by typing the main entry point skeleton (e.g. main() or principal function) first.
2. Jumps to Definitions: Jump to the top of the file to write imports/constants, or jump above/below to define helper functions and structs only when they are first referenced in the code body.
3. IDE Auto-Closing Pairs: When typing brackets ({}, [], (), <>) or quotes (""), type both opening and closing characters first, move the cursor inside, type the content, and then move the cursor past the closing character.
4. Target Line Pre-check: If you jump to a line that is not empty, move to character 0, write a newline to push code down, and go back up. Do not prepend code over existing text.
```

### Quick Workflow
1. Prompt your AI of choice with the template above and your code.
2. Copy the resulting JSON array.
3. Open an empty file in VS Code.
4. Press `Ctrl+Shift+P` (or `Cmd+Shift+P`), select **AI Typing Simulator: Run Simulation Script**, choose **Clipboard**, and watch the simulation type your code naturally!

---

## Example Script

Here is an example script that writes a simple Rust skeleton, jumps to write imports at the top, and jumps back to write the body content:

```json
[
  {
    "type": "write",
    "text": "fn main() {}"
  },
  {
    "type": "move",
    "line": 0,
    "character": 11
  },
  {
    "type": "write",
    "text": "\n"
  },
  {
    "type": "move",
    "line": 0,
    "character": 0
  },
  {
    "type": "write",
    "text": "use std::io;\n"
  },
  {
    "type": "move",
    "line": 2,
    "character": 1
  },
  {
    "type": "write",
    "text": "\n    println!(\"Start!\");"
  }
]
```

---

## License

This extension is licensed under the MIT License.
