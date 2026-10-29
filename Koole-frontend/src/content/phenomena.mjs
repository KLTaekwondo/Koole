// 现象与发现：一个现象 = 一段发现故事 + 知识点 + 「想不想实例化看看？」
// 这个模块的数据直接嵌在对应学科的首页（目前是物理主页），也可通过
// /physics-lab/phenomena/:id 单独访问某一篇。
//
// 字段说明：
//   id          URL 片段（/physics-lab/phenomena/:id）
//   subject     所属学科（physics / chemistry / math），决定它出现在哪个学科首页
//   era/eraSort 显示用的年代 & 排序用的数字（公元前写负数）
//   category    学科内部分类（力学 / 光学 …），用于筛选
//   tags        搜索用的关键词
//   story       发现故事，按时间推进的分段
//   knowledge   知识点（Markdown + LaTeX，和物理模型 knowledge 同一套写法）
//   pitfalls    容易看错的地方
//   simulation  最后「实例化」的入口：modelId 指向经典模型，params 会写进分享链接
//   sources     参考资料（史实存疑的地方要在正文里说明是「记载」或「传说」）
export const PHENOMENA = [
    {
        id: "galileo-pendulum",
        subject: "physics",
        era: "1583",
        eraSort: 1583,
        category: "力学",
        tags: ["单摆", "周期", "等时性", "摆长", "重力加速度"],
        title: "教堂里的一次走神：单摆为什么「等时」？",
        hook: "一个 19 岁的医学生用脉搏给晃动的吊灯计时，发现每次来回用的时间几乎一样。",
        story: [
            {
                year: "1583",
                title: "比萨大教堂的吊灯",
                text: "这件事来自伽利略的学生维维亚尼的记述：教堂里被风吹动的吊灯越摆幅度越小，但伽利略发现每一次来回的时间似乎没变。那时没有秒表，他只能用自己的脉搏计时，反复数下来，认定摆动周期和摆幅关系不大。细节未必完全可靠，但「等时性」这个结论确实影响了后来的钟表史。",
            },
            {
                year: "1656",
                title: "从吊灯到摆钟",
                text: "半个多世纪后，惠更斯把摆用到钟表上，做出第一台摆钟。一天的误差从原来的十几分钟降到几十秒，精确计时从这时开始。",
            },
            {
                year: "今天",
                title: "课本上的那条公式",
                text: "中学课本把结论压成一条公式：$T = 2\\pi\\sqrt{L/g}$。周期只跟摆长和当地重力加速度有关，跟摆球质量无关。但这条公式有个前提——摆角要足够小，一般要求小于 5°。",
            },
        ],
        misconception: "「摆幅越大，周期越长」这个直觉其实是对的，只是小角度时差别小到可以忽略：摆角 30° 时实际周期比公式值长约 1.7%，摆角 90° 时会长约 18%。所以课本公式是「小角度近似」，不是「永远成立」。模型默认就是 30°，正好能看到这个偏差。",
        knowledge: `## 单摆的周期

- $T = 2\\pi\\sqrt{\\dfrac{L}{g}}$

其中：$T$ 是周期（一次完整来回的时间），$L$ 是摆长（悬点到摆球重心的距离），$g$ 是当地重力加速度。

周期与摆球质量无关，与摆长的平方根成正比：摆长变成原来的 4 倍，周期变成 2 倍。

## 为什么会有「小角度」这个前提

摆的实际周期是一个无穷级数：

$$T = 2\\pi\\sqrt{\\frac{L}{g}}\\left(1 + \\frac{1}{16}\\theta_0^2 + \\cdots\\right)$$

其中 $\\theta_0$ 是最大摆角（单位是弧度）。摆角小于约 5° 时，修正项不到 0.1%，可以放心用简化公式；摆角 30° 时修正约 1.7%，90° 时约 18%——摆幅越大，摆得越「慢」。

## 周期在生活里的位置

摆钟靠的就是等时性：摆长固定，周期就固定，齿轮把摆动次数变成时间读数。反过来，测出周期就能反推重力加速度 $g$，这也是早期测量当地重力的一种方法。`,
        pitfalls: [
            "摆长不是摆球到桌面的高度，而是悬点到摆球重心的距离",
            "以为摆球越重周期越长——质量根本不在公式里",
            "忽略小角度前提：角度大时公式只是近似，模型里能直接看到差异",
            "把「一个来回」当成半个周期——周期是一次完整往复的时间",
        ],
        simulation: {
            modelId: "pendulum",
            modelName: "单摆",
            prompt: "想不想把摆长、初始角度和重力亲手调一遍，看看周期到底跟谁有关？",
            cta: "去调一调",
            params: { length: 10, initAngle: 30, gravity: 9.8 },
        },
        sources: [
            { label: "维基百科 · 单摆", url: "https://zh.wikipedia.org/wiki/%E5%8D%95%E6%91%86" },
            { label: "维基百科 · 伽利略·伽利莱", url: "https://zh.wikipedia.org/wiki/%E4%BC%BD%E5%88%A9%E7%95%A5%C2%B7%E4%BC%BD%E5%88%A9%E8%8E%B1" },
        ],
    },
    {
        id: "archimedes-buoyancy",
        subject: "physics",
        era: "前 250",
        eraSort: -250,
        category: "力学",
        tags: ["浮力", "密度", "阿基米德原理", "排水", "王冠"],
        title: "浴缸里的「尤里卡」：浮力凭什么等于排开的水重？",
        hook: "国王怀疑王冠掺了银，让他鉴定又要求不能弄坏——他在洗澡时想通了。",
        story: [
            {
                year: "前 250",
                title: "一顶不能拆的王冠",
                text: "据古罗马建筑师维特鲁威的记述，叙拉古的国王让工匠做了一顶金冠，却怀疑里面掺了银。他请阿基米德鉴定，条件是王冠不能损坏。故事流传的版本里，阿基米德是在跨进浴缸、看到水溢出来时想到办法的，兴奋地喊出「尤里卡」（我找到了）。",
            },
            {
                year: "同一时期",
                title: "把「感觉变轻」写成关系",
                text: "阿基米德给出的结论不是「水把人往上托」，而是一个可以称量的关系：物体在液体里受到的浮力，等于它排开的液体的重量。这样一来，同样重的金子比银子体积小，排水少、浮力小——称一称在水中的读数就能分辨真假。",
            },
            {
                year: "今天",
                title: "课本里的两种写法",
                text: "中学课本把它写成 $F_{\\text{浮}} = \\rho_{\\text{液}} g V_{\\text{排}}$。它解释了三件事：为什么轮船是钢做的却能浮、为什么潜艇靠水舱调节浮沉，以及为什么密度小于液体的物体漂浮时「浸入一部分就停」。",
            },
        ],
        misconception: "「浮力等于排开液体的重力」不等于「浮力等于物体重力」。只有漂浮或悬浮时才成立；沉底的物体浮力更小，它靠底部的支持力才静止。判断浮沉，比的应该是物体密度和液体密度，而不是重量。",
        knowledge: `## 浮力的两种算法

- 阿基米德原理：$F_{\\text{浮}} = \\rho_{\\text{液}} g V_{\\text{排}}$
- 称重法：$F_{\\text{浮}} = G - F_{\\text{示}}$

其中：$\\rho_{\\text{液}}$ 是液体密度，$g$ 是重力加速度，$V_{\\text{排}}$ 是物体排开液体的体积，$G$ 是物体重力，$F_{\\text{示}}$ 是物体浸在液体中时测力计的读数。

## 三种状态

漂浮时 $F_{\\text{浮}} = G$，物体只有一部分浸入；悬浮时同样 $F_{\\text{浮}} = G$，但整块浸没；沉底时 $F_{\\text{浮}} < G$，差额由底部支持力补上。

## 为什么密度就能决定浮沉

把两式写成 $\\rho_{\\text{液}} g V_{\\text{排}}$ 与 $\\rho_{\\text{物}} g V_{\\text{物}}$ 比较。浸没时 $V_{\\text{排}} = V_{\\text{物}}$，于是浮沉只取决于 $\\rho_{\\text{物}}$ 与 $\\rho_{\\text{液}}$ 的大小关系——这就是「密度决定浮沉」的由来。`,
        pitfalls: [
            "把「浮力等于排开液体重力」误当成「浮力等于物体重力」",
            "忘记 $V_{\\text{排}}$ 是排开液体的体积，不是物体总体积（漂浮时更小）",
            "认为重的物体一定下沉——一块钢铁会沉，做成轮船却能浮",
            "计算时把液体密度当成物体密度代入",
        ],
        simulation: {
            modelId: "buoyancy",
            modelName: "浮力",
            prompt: "想不想把物体密度从小于水调到大于水，亲眼看它从漂浮变成沉底？",
            cta: "去调一调",
            params: { rhoObj: 1200, rhoLiquid: 1000, volume: 0.125 },
        },
        sources: [
            { label: "维基百科 · 阿基米德原理", url: "https://zh.wikipedia.org/wiki/%E9%98%BF%E5%9F%BA%E7%B1%B3%E5%BE%B7%E5%8E%9F%E7%90%86" },
            { label: "维基百科 · 阿基米德", url: "https://zh.wikipedia.org/wiki/%E9%98%BF%E5%9F%BA%E7%B1%B3%E5%BE%B7" },
        ],
    },
    {
        id: "snell-refraction",
        subject: "physics",
        era: "1621",
        eraSort: 1621,
        category: "光学",
        tags: ["折射", "折射率", "斯涅尔定律", "全反射", "临界角"],
        title: "打捞长矛的那一下弯折：光的偏折为什么能用正弦算？",
        hook: "插进水里的桨看起来是断的，这个现象人类看了几千年，直到有人量出角度的正弦比。",
        story: [
            {
                year: "古代",
                title: "断掉的桨与变浅的水底",
                text: "把桨插进水里，露在水面外和没入水中的部分看起来不在一条线上；站在岸上看水底，会觉得比实际浅。托勒密在公元 2 世纪就记录过入射角和折射角的测量数据，但没能给出准确的关系。",
            },
            {
                year: "1621",
                title: "斯涅尔发现正弦比是常数",
                text: "荷兰天文学家和数学家斯涅尔找到了规律：入射角与折射角的正弦之比是一个常数，只跟两种介质有关。他没有发表，这个结论后来由笛卡尔公布，所以法国至今称为「笛卡尔定律」。",
            },
            {
                year: "今天",
                title: "从折射到全反射",
                text: "把常数写成两侧介质的折射率，就是课本上的 $n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2$。它还能推出一个反直觉的结论：光从水射向空气时，入射角超过临界角就再也出不去，全部被反射回来——光纤通信就建立在这条上。",
            },
        ],
        misconception: "「光总是向法线靠拢」并不总成立。准确说法是：从光疏到光密（如空气到水）折射角小于入射角，靠近法线；从光密到光疏则偏离法线。垂直入射（入射角 0°）时光线不偏折。",
        knowledge: `## 折射定律

$$n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2$$

其中：$n_1$、$n_2$ 是两侧介质的折射率，$\\theta_1$ 是入射角，$\\theta_2$ 是折射角，两个角都是从法线量起的。

## 折射率意味着什么

折射率描述光在该介质中「变慢」的程度：$n = c/v$，光在介质中的速度是真空中的 $1/n$。水的折射率约 1.33，玻璃约 1.5，钻石约 2.42——钻石之所以「闪」，和高折射率带来的强烈折射、全反射直接相关。

## 全反射与临界角

光从光密射向光疏（$n_1 > n_2$）时，入射角增大到某个值后折射光消失：

$$\\theta_c = \\arcsin\\frac{n_2}{n_1}$$

水到空气的临界角约 48.6°。超过它，光线全部反射回水中，这就是光纤能把光「关」在纤芯里的原因。`,
        pitfalls: [
            "把入射角、折射角当成与界面的夹角——应该和法线量",
            "以为光进入任何介质都向法线偏折，忽略了方向（光疏↔光密）",
            "计算 $\\arcsin$ 时输入超过 1 的值——那是全反射，不是算错",
            "把折射率和密度混为一谈（两者没有必然关系）",
        ],
        simulation: {
            modelId: "refraction",
            modelName: "光的折射",
            prompt: "把入射角推到 49° 以上，看折射光线怎么消失、只剩反射光。",
            cta: "去调一调",
            params: { incidentAngle: 60, n1: 1.33, n2: 1.0 },
        },
        sources: [
            { label: "维基百科 · 斯涅尔定律", url: "https://zh.wikipedia.org/wiki/%E6%96%AF%E6%B6%85%E5%B0%94%E5%AE%9A%E5%BE%8B" },
            { label: "维基百科 · 全反射", url: "https://zh.wikipedia.org/wiki/%E5%85%A8%E5%8F%8D%E5%B0%84" },
        ],
    },
]

export function getPhenomenonById(id) {
    return PHENOMENA.find(item => item.id === id) || null
}

/** 按年代排序后的列表，供时间轴使用 */
export const PHENOMENA_SORTED = [...PHENOMENA].sort((a, b) => a.eraSort - b.eraSort)

/** 某个学科的现象（物理/化学/数学各自的 hub 页用） */
export function getPhenomenaBySubject(subject) {
    return PHENOMENA_SORTED.filter(item => (item.subject || "physics") === subject)
}

/** 各学科的分类筛选项（从数据里自动汇总，不用手维护） */
export function getPhenomenaCategories(subject) {
    return ["全部", ...new Set(getPhenomenaBySubject(subject).map(item => item.category))]
}

/** 旧版知识小站首页用到的全部分类（保留导出，避免引用断裂） */
export const PHENOMENA_CATEGORIES = ["全部", ...new Set(PHENOMENA.map(item => item.category))]


/** 某个经典模型关联的现象（模型页做反向链接用） */
export function getPhenomenaByModelId(modelId) {
    return PHENOMENA.filter(item => item.simulation?.modelId === modelId)
}
