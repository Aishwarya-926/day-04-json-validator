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

    function handleInput() { /* ... (no changes in this function) ... */ }

    // --- REFACTORED AND CORRECTED TREE VIEW LOGIC ---

    function buildTreeView(data, parentElement) {
        parentElement.innerHTML = ''; // Clear previous tree
        const treeRoot = document.createElement('ul'); // Start with a UL
        treeRoot.className = 'tree';
        parentElement.appendChild(treeRoot);

        // The root is just the first node
        treeRoot.appendChild(createNode(data, 'JSON'));
    }
    
    // This function is completely rewritten for a better HTML structure.
    function createNode(data, key) {
        const li = document.createElement('li');
        
        const isCollapsible = typeof data === 'object' && data !== null && Object.keys(data).length > 0;

        // The header contains the clickable key.
        const header = document.createElement('div');
        header.className = 'node-header';

        const keySpan = document.createElement('span');
        keySpan.className = 'key';
        keySpan.textContent = `${key}: `;
        header.appendChild(keySpan);
        
        if (isCollapsible) {
            li.classList.add('collapsible');

            // Add a hint for what the data type is (Array or Object)
            const typeHint = document.createElement('span');
            typeHint.className = 'type-hint';
            const type = Array.isArray(data) ? 'Array' : 'Object';
            const count = Object.keys(data).length;
            typeHint.textContent = `${type}[${count}]`;
            header.appendChild(typeHint);

            // The click listener collapses the parent LI
            header.addEventListener('click', () => {
                li.classList.toggle('collapsed');
            });

            // Create the child UL and append it *inside* the LI, after the header.
            const childUl = document.createElement('ul');
            childUl.className = 'children';
            for (const childKey in data) {
                childUl.appendChild(createNode(data[childKey], childKey));
            }
            li.appendChild(header);
            li.appendChild(childUl); // Children are now proper descendants
        } else {
            // For simple values, just add the value span to the header.
            const valueSpan = document.createElement('span');
            valueSpan.className = `value ${typeof data}`;
            valueSpan.textContent = JSON.stringify(data);
            header.appendChild(valueSpan);
            li.appendChild(header);
        }
        
        return li;
    }


    function setValidState() { /* ... (no changes) ... */ }
    function setInvalidState(message) { /* ... (no changes) ... */ }
    function resetUI() { /* ... (no changes) ... */ }

    // --- Event Listeners ---
    jsonInput.addEventListener('input', handleInput);
    clearBtn.addEventListener('click', () => { /* ... (no changes) ... */ });
    copyBtn.addEventListener('click', () => { /* ... (no changes) ... */ });
});


// --- PASTE THE FULL HELPER FUNCTIONS HERE (UNCHANGED) ---
function handleInput() {
    const rawText = document.getElementById('json-input').value;
    const formattedJson = document.getElementById('formatted-json');
    const statusIndicator = document.getElementById('status-indicator');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const treeViewContainer = document.getElementById('tree-view-container');
    
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
function setValidState() {
    document.getElementById('status-indicator').textContent = 'Valid JSON';
    document.getElementById('status-indicator').className = 'status-valid';
    document.getElementById('error-container').classList.add('hidden');
    document.getElementById('json-input').style.borderColor = 'transparent';
}
function setInvalidState(message) {
    document.getElementById('status-indicator').textContent = 'Invalid JSON';
    document.getElementById('status-indicator').className = 'status-invalid';
    document.getElementById('formatted-json').innerHTML = '';
    document.getElementById('tree-view-container').innerHTML = '';
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-container').classList.remove('hidden');
}
function resetUI() {
    document.getElementById('status-indicator').textContent = 'Ready';
    document.getElementById('status-indicator').className = 'status-empty';
    document.getElementById('formatted-json').innerHTML = '';
    document.getElementById('tree-view-container').innerHTML = '';
    document.getElementById('error-container').classList.add('hidden');
}
