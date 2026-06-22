const vscode = require('vscode');
const fs = require('fs');

let stopRequested = false;
let isRunning = false;

function activate(context) {
    let runScriptCommand = vscode.commands.registerCommand('ai-typing-simulator.runScript', async () => {
        if (isRunning) {
            vscode.window.showWarningMessage('AI Typing Simulator: A simulation is already running.');
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('AI Typing Simulator: No active text editor open.');
            return;
        }

        // Ask the user where to load the simulation script
        const option = await vscode.window.showQuickPick(['Clipboard', 'Select JSON File'], {
            placeHolder: 'Select the source of the typing simulation script'
        });

        if (!option) return;

        let scriptText = '';
        if (option === 'Clipboard') {
            scriptText = await vscode.env.clipboard.readText();
        } else {
            const fileUri = await vscode.window.showOpenDialog({
                canSelectMany: false,
                filters: { 'JSON Scripts': ['json'] },
                openLabel: 'Select Simulation Script'
            });
            if (!fileUri || fileUri.length === 0) return;
            scriptText = fs.readFileSync(fileUri[0].fsPath, 'utf8');
        }

        let script;
        try {
            script = JSON.parse(scriptText);
            if (!Array.isArray(script)) {
                throw new Error('Simulation script must be a JSON array of actions.');
            }
        } catch (e) {
            vscode.window.showErrorMessage('AI Typing Simulator: Failed to parse script: ' + e.message);
            return;
        }

        vscode.window.showInformationMessage('AI Typing Simulator: Starting simulation...');
        try {
            stopRequested = false;
            isRunning = true;
            await playScript(editor, script);
            if (stopRequested) {
                vscode.window.showWarningMessage('AI Typing Simulator: Simulation stopped.');
            } else {
                vscode.window.showInformationMessage('AI Typing Simulator: Simulation completed!');
            }
        } catch (e) {
            vscode.window.showErrorMessage('AI Typing Simulator: Error during simulation: ' + e.message);
        } finally {
            isRunning = false;
        }
    });

    let stopScriptCommand = vscode.commands.registerCommand('ai-typing-simulator.stopScript', () => {
        if (!isRunning) {
            vscode.window.showInformationMessage('AI Typing Simulator: No simulation is currently running.');
            return;
        }
        stopRequested = true;
        vscode.window.showInformationMessage('AI Typing Simulator: Stopping simulation...');
    });

    context.subscriptions.push(runScriptCommand, stopScriptCommand);
}

async function playScript(editor, script) {
    for (const action of script) {
        if (stopRequested) break;
        const doc = editor.document;
        
        switch (action.type) {
            case 'write': {
                const text = action.text || '';
                let baseDelay = 50; // default medium
                if (action.speed === 'fast') baseDelay = 25;
                if (action.speed === 'slow') baseDelay = 120;
                if (typeof action.speed === 'number') baseDelay = action.speed;

                for (let i = 0; i < text.length; i++) {
                    if (stopRequested) break;
                    const char = text[i];
                    if (char === '\r') continue; // Skip carriage return, handle only \n

                    const pos = editor.selection.active;
                    
                    // Insert the character
                    await editor.edit(editBuilder => {
                        editBuilder.insert(pos, char);
                    });

                    // Determine next position
                    let nextPos;
                    if (char === '\n') {
                        nextPos = new vscode.Position(pos.line + 1, 0);
                    } else {
                        nextPos = new vscode.Position(pos.line, pos.character + 1);
                    }

                    // Move cursor selection
                    editor.selection = new vscode.Selection(nextPos, nextPos);
                    
                    // Reveal typing position to scroll with the output
                    editor.revealRange(new vscode.Range(nextPos, nextPos), vscode.TextEditorRevealType.InCenterIfOutsideViewport);

                    // Add human-like delay and typing jitter
                    let delay = baseDelay + (Math.random() * baseDelay * 0.4); // +/- 20% jitter
                    
                    // Add natural thinking pauses for spaces, punctuation, or newlines
                    if (char === ' ' && Math.random() < 0.15) {
                        delay += 100 + Math.random() * 150; // pause at word boundary
                    } else if ((char === ',' || char === ';' || char === '.') && Math.random() < 0.3) {
                        delay += 200 + Math.random() * 200; // pause at punctuation
                    } else if (char === '\n') {
                        delay += 150 + Math.random() * 250; // pause after line ends
                    }

                    await sleep(delay);
                }
                break;
            }
            case 'move': {
                const currentPos = editor.selection.active;
                let targetLine = currentPos.line;
                let targetChar = currentPos.character;

                // Handle relative vs absolute line jumping
                if (typeof action.line === 'string') {
                    if (action.line.startsWith('+') || action.line.startsWith('-')) {
                        targetLine += parseInt(action.line, 10);
                    } else {
                        targetLine = parseInt(action.line, 10);
                    }
                } else if (typeof action.line === 'number') {
                    targetLine = action.line;
                }

                // Handle relative vs absolute character jumping
                if (typeof action.character === 'string') {
                    if (action.character.startsWith('+') || action.character.startsWith('-')) {
                        targetChar += parseInt(action.character, 10);
                    } else {
                        targetChar = parseInt(action.character, 10);
                    }
                } else if (typeof action.character === 'number') {
                    targetChar = action.character;
                }

                // Bound checking
                targetLine = Math.max(0, targetLine);
                targetChar = Math.max(0, targetChar);

                const newPos = new vscode.Position(targetLine, targetChar);
                editor.selection = new vscode.Selection(newPos, newPos);
                editor.revealRange(new vscode.Range(newPos, newPos), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
                break;
            }
            case 'wait': {
                const ms = typeof action.delay === 'number' ? action.delay : 1000;
                // Break wait down into 100ms intervals to respond quickly to cancellation
                const steps = Math.ceil(ms / 100);
                for (let s = 0; s < steps; s++) {
                    if (stopRequested) break;
                    await sleep(Math.min(100, ms - s * 100));
                }
                break;
            }
            case 'backspace': {
                const count = typeof action.count === 'number' ? action.count : 1;
                for (let c = 0; c < count; c++) {
                    if (stopRequested) break;
                    const pos = editor.selection.active;
                    if (pos.line === 0 && pos.character === 0) break;
                    
                    let startPos;
                    if (pos.character > 0) {
                        startPos = new vscode.Position(pos.line, pos.character - 1);
                    } else {
                        // Backspace to previous line's end
                        const prevLineLength = doc.lineAt(pos.line - 1).text.length;
                        startPos = new vscode.Position(pos.line - 1, prevLineLength);
                    }
                    
                    const range = new vscode.Range(startPos, pos);
                    await editor.edit(editBuilder => {
                        editBuilder.delete(range);
                    });
                    
                    editor.selection = new vscode.Selection(startPos, startPos);
                    editor.revealRange(new vscode.Range(startPos, startPos), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
                    
                    // Small delay between backspaces
                    await sleep(40 + Math.random() * 30);
                }
                break;
            }
            default:
                throw new Error(`AI Typing Simulator: Unknown action type: ${action.type}`);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
