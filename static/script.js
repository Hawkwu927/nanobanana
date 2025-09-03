class NanobananaApp {
    constructor() {
        this.images = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadApiKey();
    }

    setupEventListeners() {
        const imageUpload = document.getElementById('imageUpload');
        const uploadArea = document.getElementById('uploadArea');
        const generateBtn = document.getElementById('generateBtn');
        const apiKeyInput = document.getElementById('apiKey');
        const testApiBtn = document.getElementById('testApiBtn');

        // File upload
        imageUpload.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Generate button
        generateBtn.addEventListener('click', () => this.generateImage());

        // Test API button
        testApiBtn.addEventListener('click', () => this.testApiKey());

        // Save API key
        apiKeyInput.addEventListener('blur', () => this.saveApiKey());

        // Enter key to generate
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.generateImage();
            }
        });
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.currentTarget.classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('dragover');
        
        const files = Array.from(event.dataTransfer.files);
        this.processFiles(files);
    }

    processFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result.split(',')[1];
                this.images.push({
                    name: file.name,
                    type: file.type,
                    data: base64
                });
                this.updateImagePreview();
            };
            reader.readAsDataURL(file);
        });
    }

    updateImagePreview() {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';

        this.images.forEach((image, index) => {
            const imgContainer = document.createElement('div');
            imgContainer.style.position = 'relative';
            imgContainer.style.display = 'inline-block';

            const img = document.createElement('img');
            img.src = `data:${image.type};base64,${image.data}`;
            img.alt = image.name;
            img.title = image.name;

            const removeBtn = document.createElement('button');
            removeBtn.textContent = '×';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '-5px';
            removeBtn.style.right = '-5px';
            removeBtn.style.background = '#ff4444';
            removeBtn.style.color = 'white';
            removeBtn.style.border = 'none';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.width = '20px';
            removeBtn.style.height = '20px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.fontSize = '12px';
            removeBtn.style.display = 'flex';
            removeBtn.style.alignItems = 'center';
            removeBtn.style.justifyContent = 'center';

            removeBtn.addEventListener('click', () => {
                this.images.splice(index, 1);
                this.updateImagePreview();
            });

            imgContainer.appendChild(img);
            imgContainer.appendChild(removeBtn);
            preview.appendChild(imgContainer);
        });
    }

    async generateImage() {
        const apiKey = document.getElementById('apiKey').value.trim();
        const prompt = document.getElementById('prompt').value.trim();

        if (!apiKey) {
            this.showMessage('请输入 OpenRouter API Key', 'error');
            return;
        }

        if (!prompt) {
            this.showMessage('请输入提示词', 'error');
            return;
        }

        this.setLoading(true);
        this.clearResult();

        try {
            const imageDatas = this.images.map(img => img.data);
            
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    images: imageDatas,
                    apikey: apiKey
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '生成失败');
            }

            if (result.imageUrl) {
                this.showResult(result.imageUrl);
                this.showMessage('图片生成成功！', 'success');
            } else if (result.text) {
                this.showTextResult(result.text);
                this.showMessage('生成完成！', 'success');
            } else {
                throw new Error('生成结果为空');
            }

        } catch (error) {
            console.error('生成错误:', error);
            this.showMessage(`生成失败: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(isLoading) {
        const btn = document.getElementById('generateBtn');
        const btnText = document.getElementById('btnText');
        const spinner = document.getElementById('loadingSpinner');

        btn.disabled = isLoading;
        
        if (isLoading) {
            btnText.textContent = '生成中...';
            spinner.style.display = 'inline-block';
        } else {
            btnText.textContent = '🎨 生成图片';
            spinner.style.display = 'none';
        }
    }

    showResult(imageUrl) {
        const resultArea = document.getElementById('resultArea');
        resultArea.innerHTML = '';

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = '生成的图片';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '下载图片';
        downloadBtn.style.position = 'absolute';
        downloadBtn.style.bottom = '10px';
        downloadBtn.style.right = '10px';
        downloadBtn.style.background = '#667eea';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '5px';
        downloadBtn.style.padding = '8px 16px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.style.fontSize = '14px';

        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `nanobanana-${Date.now()}.jpg`;
            link.click();
        });

        resultArea.appendChild(img);
        resultArea.appendChild(downloadBtn);
    }

    showTextResult(text) {
        const resultArea = document.getElementById('resultArea');
        resultArea.innerHTML = '';

        const textContainer = document.createElement('div');
        textContainer.style.padding = '20px';
        textContainer.style.textAlign = 'center';
        textContainer.style.color = '#666';

        const pre = document.createElement('pre');
        pre.textContent = text;
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.wordBreak = 'break-word';
        pre.style.margin = '0';

        textContainer.appendChild(pre);
        resultArea.appendChild(textContainer);
    }

    clearResult() {
        const resultArea = document.getElementById('resultArea');
        resultArea.innerHTML = '<div class="placeholder"><p>✨ 生成的图片将在这里显示</p></div>';
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        messageDiv.textContent = message;

        const container = document.querySelector('.input-section');
        container.insertBefore(messageDiv, container.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    saveApiKey() {
        const apiKey = document.getElementById('apiKey').value.trim();
        if (apiKey) {
            localStorage.setItem('nanobanana_apikey', apiKey);
        }
    }

    async testApiKey() {
        const apiKey = document.getElementById('apiKey').value.trim();
        const testBtn = document.getElementById('testApiBtn');
        const btnText = document.getElementById('testBtnText');
        const statusIndicator = document.getElementById('testStatus');

        if (!apiKey) {
            this.showMessage('请输入 API Key', 'error');
            return;
        }

        // Update UI for testing
        testBtn.disabled = true;
        testBtn.classList.add('testing');
        btnText.textContent = '测试中...';
        statusIndicator.classList.remove('success');
        statusIndicator.classList.add('testing');

        try {
            const response = await fetch('/test-api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ apikey: apiKey })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Success
                statusIndicator.classList.remove('testing');
                statusIndicator.classList.add('success');
                btnText.textContent = '连接成功';
                this.showMessage('API Key 连接成功！', 'success');
                
                // Save the valid API key
                this.saveApiKey();
            } else {
                throw new Error(result.error || '连接失败');
            }

        } catch (error) {
            // Failure
            statusIndicator.classList.remove('testing');
            statusIndicator.classList.remove('success');
            btnText.textContent = '测试连接';
            this.showMessage(`API Key 测试失败: ${error.message}`, 'error');
        } finally {
            testBtn.disabled = false;
            testBtn.classList.remove('testing');
        }
    }

    loadApiKey() {
        const savedApiKey = localStorage.getItem('nanobanana_apikey');
        if (savedApiKey) {
            document.getElementById('apiKey').value = savedApiKey;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NanobananaApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause any ongoing processes when tab is hidden
        console.log('App paused');
    } else {
        // Resume processes when tab becomes visible
        console.log('App resumed');
    }
});

// Error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    event.preventDefault();
});