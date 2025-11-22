// aiService.js - 大模型服务封装

class AIService {
    constructor() {
        // 从localStorage获取API Key，如果不存在则提示用户
        this.apiKey = localStorage.getItem('dashscope_api_key') || '';
        this.apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
        this.model = 'Qwen-VL'; // 使用通义千问最强模型
    }

    // 设置API Key
    setApiKey(key) {
        this.apiKey = key.trim();
        localStorage.setItem('dashscope_api_key', this.apiKey);
        return true;
    }

    // 获取生物分类信息
    async getBiologyClassification(name) {
        if (!this.apiKey) {
            throw new Error('需要API Key才能使用AI查询功能。点击"设置API Key"按钮添加。');
        }

        try {
            const prompt = `
你是一个专业的生物分类学家。请根据用户提供的生物名称，返回其完整的生物分类信息。
要求：
1. 严格按照生物分类学标准返回：界、门、纲、目、科、属、种
2. 同时提供学名（拉丁文）和简要描述
3. 如果不确定，返回"不确定"而不是猜测
4. 用JSON格式返回，包含以下字段：kingdom, phylum, class, order, family, genus, species, scientificName, description
5. 只返回JSON，不要任何其他文本

生物名称：${name}
`;

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    input: {
                        messages: [
                            {
                                role: 'user',
                                content: prompt
                            }
                        ]
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API错误: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            const content = data.output.choices[0].message.content;
            
            // 尝试解析JSON
            try {
                return JSON.parse(content);
            } catch (e) {
                console.error('AI返回内容解析失败:', content);
                throw new Error('AI返回的数据格式不正确，请重试');
            }

        } catch (error) {
            console.error('AI查询失败:', error);
            throw error;
        }
    }

    // 检查API Key是否有效
    async testApiKey() {
        if (!this.apiKey) return false;
        
        try {
            await this.getBiologyClassification('人类');
            return true;
        } catch (error) {
            return false;
        }
    }
}

// 单例模式
const aiService = new AIService();