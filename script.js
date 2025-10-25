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

    // The main function that handles input and triggers all other actions
    function handleInput() {
        const rawText = jsonInput.value;
        
        if (rawText.trim() === '') {
            resetUI();
            return;
        }

        try {
            const parsedJson = JSON.parse(rawText);
            // If parsing succeeds, the JSON is valid
            setValidState();
            
            // 1. Format and highlight the JSON
            const formattedText = JSON.stringify(parsedJson, null, 2);
            formattedJson.innerHTML = Prism.highlight(formattedText, Prism.languages.json, 'json');

            // 2. Build and display the interactive tree view
            buildTreeView(parsedJson, treeViewContainer);

        } catch (error) {
            // If parsing fails, the JSON is invalid
            setInvalidState(error.message);
        }
    }

    // Recursively builds the HTML for the tree view
    function buildTreeView(data, parentElement) {
        parentElement.innerHTML = ''; // Clear previous tree
        const treeRoot = document.createElement('div');
        treeRoot.className = 'tree';
        parentElement.appendChild(treeRoot);

        const rootNode = createNode(data, 'JSON');
        treeRoot.appendChild(rootNode);
    }
    
    // Helper function for buildTreeView to create a single node
    function createNode(data, key) {
        const li = document.createElement('li');
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'tree-node';

        const isCollapsible = typeof data === 'object' && data !== null && Object.keys(data).length > 0;
        
        const keySpan = document.createElement('span');
        keySpan.className = 'key';
        keySpan.textContent = `${key}: `;
        nodeDiv.appendChild(keySpan);
        
        if (isCollapsible) {
            nodeDiv.classList.add('collapsible');
            keySpan.addEventListener('click', () => {
                nodeDiv.classList.toggle('collapsed');
            });
            
            const childUl = document.createElement('ul');
            for (const childKey in data) {
                childUl.appendChild(createNode(data[childKey], childKey));
            }
            li.appendChild(nodeDiv);
            li.appendChild(childUl);
        } else {
            const valueSpan = document.createElement('span');
            valueSpan.className = `value ${typeof data}`;
            valueSpan.textContent = JSON.stringify(data);
            nodeDiv.appendChild(valueSpan);
            li.appendChild(nodeDiv);
        }
        
        return li;
    }


    function setValidState() {
        statusIndicator.textContent = 'Valid JSON';
        statusIndicator.className = 'status-valid';
        errorContainer.classList.add('hidden');
        jsonInput.style.borderColor = 'transparent';
    }

    function setInvalidState(message) {
        statusIndicator.textContent = 'Invalid JSON';
        statusIndicator.className = 'status-invalid';
        formattedJson.innerHTML = ''; // Clear formatted view
        treeViewContainer.innerHTML = ''; // Clear tree view
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
    }

    function resetUI() {
        statusIndicator.textContent = 'Ready';
        statusIndicator.className = 'status-empty';
        formattedJson.innerHTML = '';
        treeViewContainer.innerHTML = '';
        errorContainer.classList.add('hidden');
    }

    // --- Event Listeners ---
    jsonInput.addEventListener('input', handleInput);

    clearBtn.addEventListener('click', () => {
        jsonInput.value = '';
        resetUI();
    });

    copyBtn.addEventListener('click', () => {
        const code = formattedJson.innerText;
        navigator.clipboard.writeText(code).then(() => {
            // Optional: add feedback like changing button text
        });
    });

});
