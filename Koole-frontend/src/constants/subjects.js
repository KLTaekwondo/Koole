// 学科注册表：首页轮播、导航栏、路线图都从这里读取，不再各自硬编码。
// visibility 决定「出现在哪」：
//   public   —— 已开放：导航栏 + 首页主卡片
//   planned  —— 计划中：只在首页显示为 COMING SOON，不进导航
//   archived —— 暂不纳入规划：收进首页「其他学科」卡片，可在 /subjects 查看
// color  —— 首页卡片与标识用色
// accent —— 该学科页面内部（实验室、现象时间轴、文章详情）的主题色
// 以后恢复某门学科，只改 visibility 一个字段，页面代码不用动。
export const SUBJECTS = [
    {
        id: "physics",
        number: "01",
        name: "物理",
        path: "/physics-lab",
        visibility: "public",
        color: "#e05a4d",
        accent: "#3b82f6",
        description: "改变参数，观察力、运动、光与电如何作用。",
        vision: "模型 · 关卡 · 沙盒",
    },
    {
        id: "math",
        number: "02",
        name: "数学",
        path: "/math-lab",
        visibility: "public",
        color: "#477cdb",
        accent: "#477cdb",
        description: "拖动变量，让函数、几何和概率呈现变化。",
        vision: "函数 · 几何 · 概率",
    },
    {
        id: "chemistry",
        number: "03",
        name: "化学",
        path: "/chem-lab",
        visibility: "public",
        color: "#2aa27f",
        accent: "#2aa27f",
        description: "从元素周期表到分子结构，从微观认识物质。",
        vision: "元素 · 分子 · 晶体",
    },
    {
        id: "biology",
        number: "04",
        name: "生物",
        path: "/bio-lab",
        visibility: "planned",
        color: "#6ca647",
        accent: "#6ca647",
        description: "进入细胞与生命结构，在三维空间观察层次。",
        vision: "细胞 · DNA · 神经元",
    },
    {
        id: "geography",
        number: "05",
        name: "地理",
        path: "/geography-lab",
        visibility: "planned",
        color: "#2b9cab",
        accent: "#2b9cab",
        description: "转动地球、展开地图，理解空间中的自然规律。",
        vision: "地球 · 地图 · 气候",
    },
    {
        id: "history",
        number: "06",
        name: "历史",
        path: "/history-lab",
        visibility: "archived",
        color: "#a8744c",
        accent: "#a8744c",
        description: "在时间、人物与事件之间看清因果联系。",
        vision: "时间 · 人物 · 事件",
    },
    {
        id: "chinese",
        number: "07",
        name: "语文",
        path: "/chinese-lab",
        visibility: "archived",
        color: "#d95b4c",
        accent: "#d95b4c",
        description: "从文字、人物与意象，看见文章内部的脉络。",
        vision: "文本 · 关系 · 意象",
    },
    {
        id: "english",
        number: "08",
        name: "英语",
        path: "/english-lab",
        visibility: "archived",
        color: "#866bd5",
        accent: "#866bd5",
        description: "拆解句子结构，在语境里连接词义与表达。",
        vision: "语境 · 句法 · 发音",
    },
    {
        id: "politics",
        number: "09",
        name: "政治",
        path: "/politics-lab",
        visibility: "archived",
        color: "#cf9136",
        accent: "#cf9136",
        description: "连接概念、制度与现实案例，建立思考框架。",
        vision: "概念 · 制度 · 案例",
    },
]

export const PUBLIC_SUBJECTS = SUBJECTS.filter(subject => subject.visibility === "public")
export const PLANNED_SUBJECTS = SUBJECTS.filter(subject => subject.visibility === "planned")
export const ARCHIVED_SUBJECTS = SUBJECTS.filter(subject => subject.visibility === "archived")

export function getSubjectById(id) {
    return SUBJECTS.find(subject => subject.id === id) || null
}

export function getSubjectByPath(path) {
    return SUBJECTS.find(subject => subject.path === path) || null
}
