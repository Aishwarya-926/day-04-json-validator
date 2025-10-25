document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const jsonInput = document.getElementById('json-input');
    const formattedJson = document.getElementById('formatted-json');
    const statusIndicator = document.getElementById('status-indicator');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const treeView = document.getElementById('tree-view');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const outputTabs = document.getElementById('output-tabs');

    // --- Debounce Function (For Performance) ---
    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // --- Core Processing Function ---
    function processInput() {
        const rawText = jsonInput.value;
        if (rawText.trim() === '') {
            resetUI();
            return;
        }

        try {
            const parsedJson = JSON.parse(rawText);
            setValidState();
            
            // Format and highlight the text view
            const formattedText = JSON.stringify(parsedJson, null, 2);
            formattedJson.innerHTML = Prism.highlight(formattedText, Prism.languages.json, 'json');

            // Build the interactive tree view
            buildTreeView(parsedJson, treeView);

        } catch (error) {
            setInvalidState(error.message);
        }
    }

    // --- Tree View Logic (This logic is sound) ---
    function buildTreeView(data, parentElement) {
        parentElement.innerHTML = '';
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
            header.addEventListener('click', () => li.classList.toggle('collapsed'));
            
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

    // --- UI State Functions ---
    function setValidState() {
        statusIndicator.textContent = 'Valid JSON';
        statusIndicator.className = 'status-valid';
        errorContainer.classList.add('hidden');
    }

    function setInvalidState(message) {
        statusIndicator.textContent = 'Invalid JSON';
        statusIndicator.className = 'status-invalid';
        formattedJson.innerHTML = '';
        treeView.innerHTML = '';
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
    }

    function resetUI() {
        jsonInput.value = '';
        statusIndicator.textContent = 'Ready';
        statusIndicator.className = 'status-empty';
        formattedJson.innerHTML = '';
        treeView.innerHTML = '';
        errorContainer.classList.add('hidden');
    }

    // --- Tab Switching ---
    outputTabs.addEventListener('click', (e) => {
        if (!e.target.classList.contains('tab-btn')) return;
        const targetTab = e.target.dataset.tab;
        
        outputTabs.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        document.querySelectorAll('.output-view').forEach(view => {
            view.classList.toggle('active', view.id === `${targetTab}-view`);
        });
    });

    // --- Event Listeners ---
    const debouncedProcessInput = debounce(processInput, 250);
    jsonInput.addEventListener('input', debouncedProcessInput);
    jsonInput.addEventListener('paste', () => setTimeout(processInput, 0)); // Immediate on paste
    clearBtn.addEventListener('click', resetUI);
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(formattedJson.innerText);
    });

    // Initial call to set the empty state correctly
    resetUI();
});
