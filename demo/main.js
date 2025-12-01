"use strict";

import { StackTestSuite } from '../tests/stack.test.js';
import { ErrorTestSuite } from '../tests/errors.test.js';
import { ErrorTypes } from '../src/errors/errors.js';
import * as forth from '../src/forth.js';

const fvm = new forth.Fvm();
const textbox = document.getElementById('textbox');
const runTestButton = document.getElementById('run-tests-btn');
const resetButton = document.getElementById('reset-btn');

// Example buttons handler
document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        textbox.value = code;
        // Focus and simulate Enter key
        textbox.focus();
        textbox.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
    });
});

const put = text => {
    const output = document.getElementById('output');
    const line = document.createElement('div');
    line.textContent = '-> ' + text;
    output.appendChild(line);

    const prompt = document.getElementById('prompt');
    prompt.scrollTop = prompt.scrollHeight;

    updateStackVisualization();
};

const updateStackVisualization = () => {
    const stackViz = document.getElementById('stack-visualization');
    const stackTitle = document.getElementById('stack-header-title');
    const stack = fvm.dataStack;
    
    stackTitle.textContent = `Stack - <${stack.length}>`;

    if (stack.length === 0) {
        stackViz.innerHTML = '<div class="stack-empty">empty</div>';
        return;
    }

    stackViz.innerHTML = stack.map(value => `<div class="stack-item">${value}</div>`).join('');
};

const clear = () => {
    const output = document.getElementById('output');
    output.innerHTML = '';
    updateStackVisualization();
};

const confirmDialog = message => {
    return new Promise(resolve => {
        const overlay = document.getElementById('custom-confirm');
        const msg = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok');
        const cancelBtn = document.getElementById('confirm-cancel');

        msg.textContent = message;
        overlay.classList.remove('hidden');

        const cleanUp = () => {
            overlay.classList.add('hidden');
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
        };

        const onOk = () => {
            cleanUp();
            resolve(true);
        };

        const onCancel = () => {
            cleanUp();
            resolve(false);
        };

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
    });
};


textbox.addEventListener('keyup', e => {
    if (e.code === 'Enter') {
        const text = textbox.value;
        textbox.value = '';
        //fvm.execute(text);
        try {
            fvm.execute(text);
        } 
        catch (e) {
            if (e.name === ErrorTypes.STACK || e.name === ErrorTypes.OPERATION) {
                put(`Error: ${e.message}`)
                return
            }

            if (e.name === ErrorTypes.PARSE) {
                put(`Parsing Error: ${e.message} - ${e.rawText}`);
                return
            }
            
            put(`JS Error: ${e.message}`);
            return;
        }

        put(`${text} ${fvm.output}  ${fvm.status}`);
    }
});

runTestButton.addEventListener('click', async () => {
    const confirmed = await confirmDialog("Running the test suite will reset the FVM.");
    if (confirmed) {
        fvm.reset();
        clear();
        put("Running Forth.js test suite");
        const ets = new ErrorTestSuite(put);
        ets.run();
        const sts = new StackTestSuite(put);
        sts.run();
    } 
});

resetButton.addEventListener('click', async () => {
    const confirmed = await confirmDialog("Are you sure you want to reset the FVM?");
    if (confirmed) {
        fvm.reset();
        clear();
        put("FVM has been reset");
    }    
});

put("forth.js virtual machince created");

