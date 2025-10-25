document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const jsonInput = document.getElementById('json-input');
    const formattedJson = document.getElementById('formatted-json');
    const statusIndicator = document.getElementById('status-indicator');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const treeViewContainer = document.getElementById('tree-view-container');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');

    // This is the main function that handles validation and rendering
    function handleInput() {
        const rawText = jsonInput.value;
        
        if (rawText.trim() === '') {
            resetUI();
            return;
        }

        try {
            const parsedJson = JSON.parse(rawText);
            setValidState();
            
            const formattedText = JSON.stringify(parsedJson, null, 2);
            formattedJson.innerHTML = Prism.highlight(formattedText, Prism.languages.json, 'json');

            buildTreeView(parsedJson, treeViewContainer);

        } catch (error) {
            setInvalidState(error.message);
        }
    }

    // --- Corrected and Refactored Tree View Logic ---

    function buildTreeView(data, parentElement) {
        parentElement.innerHTML = ''; // Clear previous tree
        const treeRoot = document.createElement('ul');
        treeRoot.className = 'tree';
        parentElement.appendChild(treeRoot);
        treeRoot.appendChild(createNode(data, 'JSON'));
    }
    
    function createNode(data, key) {
        const li = document.createElement('li');
        const isCollapsible = typeof data === 'object' && data !== null && Object.keys(data).length > 0;
        const header = document.createElement('div');
        header.className = 'node-header';

        const keySpan = document.createElement('span');
        keySpan.className = 'key';
        keySpan.textContent = `${key}: `;
        header.appendChild(keySpan);
        
        if (isCollapsible) {
            li.classList.add('collapsible');
            const typeHint = document.createElement('span');
            typeHint.className = 'type-hint';
            const type = Array.isArray(data) ? 'Array' : 'Object';
            const count = Object.keys(data).length;
            typeHint.textContent = `${type}[${count}]`;
            header.appendChild(typeHint);

            header.addEventListener('click', () => {
                li.classList.toggle('collapsed');
            });

            const childUl = document.createElement('ul');
            childUl.className = 'children';
            for (const childKey in data) {
                childUl.appendChild(createNode(data[childKey], childKey));
            }
            li.appendChild(header);
            li.appendChild(childUl);
        } else {
            const valueSpan = document.createElement('span');
            valueSpan.className = `value ${typeof data}`;
            valueSpan.textContent = JSON.stringify(data);
            header.appendChild(valueSpan);
            li.appendChild(header);
        }
        
        return li;
    }

    function setValidState() {
        statusIndicator.textContent = 'Valid JSON';
        statusIndicator.className = 'status-valid';
        errorContainer.classList.add('hidden');
    }

    function setInvalidState(message) {
        statusIndicator.textContent = 'Invalid JSON';
        statusIndicator.className = 'status-invalid';
        formattedJson.innerHTML = '';
        treeViewContainer.innerHTML = '';
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
    }

    function resetUI() {
        jsonInput.value = '';
        statusIndicator.textContent = 'Ready';
        statusIndicator.className = 'status-empty';
        formattedJson.innerHTML = '';
        treeViewContainer.innerHTML = '';
        errorContainer.classList.add('hidden');
    }

    // --- EVENT LISTENERS ---

    // THE DEFINITIVE FIX: Use the 'change' event instead of 'input'.
    // This function will now only run when the user is DONE editing and clicks away.
    jsonInput.addEventListener('change', handleInput);
    
    // We also want it to run when the user pastes text.
    jsonInput.addEventListener('paste', () => {
        // Use a tiny timeout to allow the paste operation to complete before we read the value.
        setTimeout(handleInput, 0);
    });

    clearBtn.addEventListener('click', resetUI);

    copyBtn.addEventListener('click', () => {
        const code = formattedJson.innerText;
        navigator.clipboard.writeText(code);
    });
});
