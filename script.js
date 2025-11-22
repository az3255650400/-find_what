// DOM元素
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultContent = document.getElementById('resultContent');
const exampleButtons = document.querySelectorAll('.example-btn');
const aiToggle = document.getElementById('aiToggle');
const dataSource = document.getElementById('dataSource');
const apiKeyButton = document.getElementById('apiKeyButton');
const apiKeyStatus = document.getElementById('apiKeyStatus');
const apiKeyModal = document.getElementById('apiKeyModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKey = document.getElementById('saveApiKey');
const testApiKey = document.getElementById('testApiKey');
const apiKeyTestResult = document.getElementById('apiKeyTestResult');
const closeBtn = document.querySelector('.close');
const howToUse = document.getElementById('howToUse');
const modeStatus = document.getElementById('modeStatus');

// 状态变量
let isAIMode = true;
let isLoading = false;

// 检查并显示API Key状态
function checkApiKeyStatus() {
    if (aiService.apiKey) {
        aiService.testApiKey().then(isValid => {
            apiKeyStatus.textContent = isValid ? 'API Key 有效' : 'API Key 无效';
            apiKeyStatus.className = isValid ? 'api-key-status status-valid' : 'api-key-status status-invalid';
        }).catch(() => {
            apiKeyStatus.textContent = 'API Key 无效';
            apiKeyStatus.className = 'api-key-status status-invalid';
        });
    } else {
        apiKeyStatus.textContent = '未设置API Key';
        apiKeyStatus.className = 'api-key-status status-invalid';
    }
}

// 显示加载状态
function showLoading(message = '正在查询中...') {
    isLoading = true;
    resultContent.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
            <div class="loading-text">${isAIMode ? 'AI正在搜索生物分类信息...' : '正在查询本地数据库...'}</div>
        </div>
    `;
}

// 隐藏加载状态
function hideLoading() {
    isLoading = false;
}

// 显示错误信息
function showError(message) {
    resultContent.innerHTML = `
        <p class="not-found">
            <i class="fas fa-exclamation-triangle"></i> ${message}
        </p>
        ${aiService.apiKey ? '' : `
        <div style="margin-top: 15px; text-align: center;">
            <button id="setupApiKeyBtn" class="api-key-btn">
                <i class="fas fa-key"></i> 设置API Key
            </button>
        </div>
        `}
    `;
    
    if (!aiService.apiKey) {
        document.getElementById('setupApiKeyBtn')?.addEventListener('click', () => {
            apiKeyModal.style.display = 'flex';
        });
    }
}

// 显示查询结果
function displayResult(organism, source = 'local') {
    hideLoading();
    
    // 设置数据来源标签
    dataSource.textContent = source === 'local' ? '本地数据库' : 'AI智能查询';
    dataSource.className = `data-source ${source}`;
    
    resultContent.innerHTML = `
        <div class="result-info">
            <h3>${organism.name || '未知生物'}</h3>
            <p class="scientific-name">学名: ${organism.scientificName || 'N/A'}</p>
            <p>界: ${organism.kingdom || 'N/A'}</p>
            <p>门: ${organism.phylum || 'N/A'}</p>
            <p>纲: ${organism.class || 'N/A'}</p>
            <p>目: ${organism.order || 'N/A'}</p>
            <p>科: ${organism.family || 'N/A'}</p>
            <p>属: ${organism.genus || 'N/A'}</p>
            <p>种: ${organism.species || 'N/A'}</p>
            <p><strong>简介:</strong> ${organism.description || '暂无描述'}</p>
        </div>
    `;
}

// AI增强查询
async function aiEnhancedSearch(name) {
    showLoading(`正在查询 "${name}"...`);
    
    try {
        // 先尝试本地数据
        const localResult = getOrganismInfo(name);
        if (localResult) {
            console.log("✅ 本地查询成功: ", name);
            displayResult(localResult, 'local');
            return;
        }
        
        console.log("⚠️ 本地未找到，尝试AI查询");
        
        // 本地没有，使用AI查询
        if (!aiService.apiKey) {
            throw new Error('需要API Key才能使用AI查询功能。点击"设置API Key"按钮添加。');
        }
        
        const aiResult = await aiService.getBiologyClassification(name);
        
        // 将AI结果转换为标准格式
        const formattedResult = {
            name: name,
            kingdom: aiResult.kingdom || '未知界',
            phylum: aiResult.phylum || '未知门',
            class: aiResult.class || '未知纲',
            order: aiResult.order || '未知目',
            family: aiResult.family || '未知科',
            genus: aiResult.genus || '未知属',
            species: aiResult.species || '未知种',
            scientificName: aiResult.scientificName || 'N/A',
            description: aiResult.description || 'AI生成的描述，可能不完全准确'
        };
        
        displayResult(formattedResult, 'ai');
        
    } catch (error) {
        hideLoading();
        showError(error.message || '查询失败，请重试');
        console.error('查询错误:', error);
    }
}

// 搜索功能
async function searchOrganism() {
    if (isLoading) return;
    
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        showError('请输入生物名称');
        return;
    }
    
    if (isAIMode) {
        await aiEnhancedSearch(searchTerm);
    } else {
        // 仅本地查询
        showLoading(`正在查询 "${searchTerm}"...`);
        
        try {
            const organism = getOrganismInfo(searchTerm);
            if (organism) {
                displayResult(organism, 'local');
            } else {
                hideLoading();
                showError(`本地数据库中未找到 "${searchTerm}"，尝试开启AI模式查询更多生物`);
            }
        } catch (error) {
            hideLoading();
            showError(error.message || '本地查询失败');
        }
    }
}

// 事件监听
if (searchButton) {
    searchButton.addEventListener('click', searchOrganism);
}

if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !isLoading) {
            searchOrganism();
        }
    });
}

// AI模式切换 - 核心修复：只改变状态，不触发查询
if (aiToggle) {
    aiToggle.addEventListener('click', function() {
        isAIMode = !isAIMode;
        this.classList.toggle('active', isAIMode);
        
        // 修复按钮跳动问题：使用固定宽度，文本只在按钮内变化
        this.innerHTML = isAIMode ? 
            '<i class="fas fa-robot"></i> AI模式' : 
            '<i class="fas fa-database"></i> 仅本地';
        
        // 添加状态提示（可选）
        if (modeStatus) {
            const statusText = isAIMode ? 'AI模式已启用' : '已切换为仅本地模式';
            modeStatus.textContent = statusText;
            modeStatus.style.opacity = '1';
            modeStatus.style.background = isAIMode ? '#a8d1ff' : '#a8e6cf';
            modeStatus.style.color = isAIMode ? '#2c3e50' : '#2a6f4c';
            
            setTimeout(() => {
                modeStatus.style.transition = 'opacity 1s';
                modeStatus.style.opacity = '0';
            }, 2000);
        }
    });
}

// 示例按钮事件
exampleButtons.forEach(button => {
    button.addEventListener('click', function() {
        const name = this.getAttribute('data-name');
        searchInput.value = name;
        
        // 自动聚焦到输入框
        searchInput.focus();
        
        // 如果是AI示例，确保AI模式开启
        if (this.classList.contains('ai-example')) {
            if (!isAIMode) {
                isAIMode = true;
                aiToggle.classList.add('active');
                aiToggle.innerHTML = '<i class="fas fa-robot"></i> AI模式';
            }
        }
    });
});

// API Key相关事件
if (apiKeyButton) {
    apiKeyButton.addEventListener('click', () => {
        apiKeyModal.style.display = 'flex';
        apiKeyInput.value = aiService.apiKey || '';
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        apiKeyModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === apiKeyModal) {
        apiKeyModal.style.display = 'none';
    }
});

if (saveApiKey) {
    saveApiKey.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            aiService.setApiKey(key);
            checkApiKeyStatus();
            apiKeyModal.style.display = 'none';
            showApiKeySuccess();
        } else {
            alert('请输入有效的API Key');
        }
    });
}

if (testApiKey) {
    testApiKey.addEventListener('click', async () => {
        const key = apiKeyInput.value.trim();
        if (!key) {
            apiKeyTestResult.innerHTML = '<div class="test-error">请输入API Key</div>';
            return;
        }
        
        aiService.setApiKey(key);
        apiKeyTestResult.innerHTML = '<div class="loading-text">测试连接中...</div>';
        
        try {
            const isValid = await aiService.testApiKey();
            apiKeyTestResult.innerHTML = isValid ? 
                '<div class="test-success">✅ 连接成功！API Key有效</div>' :
                '<div class="test-error">❌ 连接失败！API Key无效</div>';
        } catch (error) {
            apiKeyTestResult.innerHTML = `<div class="test-error">❌ 测试失败: ${error.message}</div>`;
        }
    });
}

function showApiKeySuccess() {
    resultContent.innerHTML = `
        <div class="loading">
            <div style="font-size: 3em; color: #00b894; margin-bottom: 15px;">
                <i class="fas fa-check-circle"></i>
            </div>
            <div style="font-size: 1.2em; font-weight: bold; color: #27ae60;">
                API Key设置成功！
            </div>
            <div style="margin-top: 10px; color: #7f8c8d;">
                现在可以使用AI查询任何生物了
            </div>
            <button id="tryAiSearch" class="api-key-btn" style="margin-top: 20px;">
                <i class="fas fa-robot"></i> 试试AI查询
            </button>
        </div>
    `;
    
    document.getElementById('tryAiSearch')?.addEventListener('click', () => {
        searchInput.value = '熊猫';
        searchOrganism();
    });
}

// "如何获取API Key"链接
if (howToUse) {
    howToUse.addEventListener('click', (e) => {
        e.preventDefault();
        apiKeyModal.style.display = 'flex';
        apiKeyInput.value = '';
    });
}

// 页面加载初始化
window.onload = function() {
    // 检查API Key状态
    checkApiKeyStatus();
    
    // 设置默认模式
    if (aiToggle) {
        if (!aiService.apiKey) {
            // 没有API Key时默认使用本地模式
            isAIMode = false;
            aiToggle.classList.remove('active');
            aiToggle.innerHTML = '<i class="fas fa-database"></i> 仅本地';
        }
    }
    
    // 显示欢迎信息
    setTimeout(() => {
        if (!aiService.apiKey) {
            resultContent.innerHTML = `
                <div class="placeholder">
                    <p>欢迎使用生物分类查询助手！</p>
                    <p style="margin-top: 10px; font-weight: bold; color: #3498db;">
                        <i class="fas fa-lightbulb"></i> 提示：设置API Key后可以查询更多生物！
                    </p>
                    <div style="margin-top: 20px; text-align: center;">
                        <button id="welcomeApiKeyBtn" class="api-key-btn">
                            <i class="fas fa-key"></i> 设置API Key
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('welcomeApiKeyBtn')?.addEventListener('click', () => {
                apiKeyModal.style.display = 'flex';
            });
        } else {
            resultContent.innerHTML = `
                <p class="placeholder">欢迎使用生物分类查询助手！输入生物名称开始查询...
                    <br><small>已启用AI增强模式，可查询更多生物</small>
                </p>
            `;
        }
    }, 300);
    
    // 添加页面加载动画
    setTimeout(() => {
        document.querySelector('.container').style.opacity = '1';
        document.querySelector('.container').style.transform = 'translateY(0)';
    }, 200);
};

// 添加键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter 触发查询
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        searchOrganism();
    }
    
    // Esc 关闭模态框
    if (e.key === 'Escape' && apiKeyModal.style.display === 'flex') {
        apiKeyModal.style.display = 'none';
    }
});

// 初始化时显示API Key状态
setTimeout(checkApiKeyStatus, 500);