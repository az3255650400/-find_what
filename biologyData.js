// 生物分类数据
const biologyData = {
    // 动物界
    "人类": {
        kingdom: "动物界",
        phylum: "脊索动物门",
        class: "哺乳纲",
        order: "灵长目",
        family: "人科",
        genus: "人属",
        species: "智人",
        scientificName: "Homo sapiens",
        description: "现代人类，具有高度发达的大脑和直立行走的能力。"
    },
    "老虎": {
        kingdom: "动物界",
        phylum: "脊索动物门",
        class: "哺乳纲",
        order: "食肉目",
        family: "猫科",
        genus: "豹属",
        species: "虎",
        scientificName: "Panthera tigris",
        description: "大型猫科动物，是顶级掠食者，主要分布在亚洲。"
    },
    "家鸽": {
        kingdom: "动物界",
        phylum: "脊索动物门",
        class: "鸟纲",
        order: "鸽形目",
        family: "鸠鸽科",
        genus: "鸽属",
        species: "原鸽",
        scientificName: "Columba livia domestica",
        description: "被人类驯化的鸟类，常用于通信和观赏。"
    },
    
    // 植物界
    "玫瑰": {
        kingdom: "植物界",
        phylum: "被子植物门",
        class: "双子叶植物纲",
        order: "蔷薇目",
        family: "蔷薇科",
        genus: "蔷薇属",
        species: "月季",
        scientificName: "Rosa chinensis",
        description: "著名的观赏植物，被誉为'花中皇后'，具有浓郁的香气。"
    },
    "松树": {
        kingdom: "植物界",
        phylum: "裸子植物门",
        class: "松柏纲",
        order: "松柏目",
        family: "松科",
        genus: "松属",
        species: "油松",
        scientificName: "Pinus tabuliformis",
        description: "常绿乔木，适应性强，广泛分布于北半球。"
    },
    
    // 真菌界
    "蘑菇": {
        kingdom: "真菌界",
        phylum: "担子菌门",
        class: "伞菌纲",
        order: "伞菌目",
        family: "蘑菇科",
        genus: "蘑菇属",
        species: "双孢蘑菇",
        scientificName: "Agaricus bisporus",
        description: "常见的食用菌，广泛栽培，营养丰富。"
    },
    "酵母": {
        kingdom: "真菌界",
        phylum: "子囊菌门",
        class: "酵母纲",
        order: "酵母目",
        family: "酵母科",
        genus: "酵母属",
        species: "酿酒酵母",
        scientificName: "Saccharomyces cerevisiae",
        description: "单细胞真菌，广泛应用于酿酒、面包制作等发酵过程。"
    },
    
    // 其他常见生物
    "大肠杆菌": {
        kingdom: "细菌界",
        phylum: "变形菌门",
        class: "γ-变形菌纲",
        order: "肠杆菌目",
        family: "肠杆菌科",
        genus: "埃希氏菌属",
        species: "大肠杆菌",
        scientificName: "Escherichia coli",
        description: "常见的肠道细菌，部分菌株对人体有益，部分可能致病。"
    },
    "蝴蝶": {
        kingdom: "动物界",
        phylum: "节肢动物门",
        class: "昆虫纲",
        order: "鳞翅目",
        family: "凤蝶科",
        genus: "凤蝶属",
        species: "金凤蝶",
        scientificName: "Papilio machaon",
        description: "美丽的昆虫，经历完全变态发育，是重要的传粉者。"
    },
    "青蛙": {
        kingdom: "动物界",
        phylum: "脊索动物门",
        class: "两栖纲",
        order: "无尾目",
        family: "蛙科",
        genus: "蛙属",
        species: "黑斑蛙",
        scientificName: "Pelophylax nigromaculatus",
        description: "两栖动物，幼体生活在水中，成体可水陆两栖，是重要的环境指示物种。"
    }
};

// 获取生物信息的函数
function getOrganismInfo(name) {
    // 不区分大小写和空格
    const cleanName = name.trim().toLowerCase();
    
    // 在数据中查找匹配的生物
    for (const [key, value] of Object.entries(biologyData)) {
        if (key.toLowerCase() === cleanName) {
            return {
                name: key,
                ...value
            };
        }
    }
    
    // 如果没有找到，尝试模糊匹配
    for (const [key, value] of Object.entries(biologyData)) {
        if (key.toLowerCase().includes(cleanName) || cleanName.includes(key.toLowerCase())) {
            return {
                name: key,
                ...value
            };
        }
    }
    
    return null;
}