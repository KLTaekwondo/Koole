// 知识小站：一个现象 = 一段发现故事 + 知识点 + 「想不想实例化看看？」
//
// 字段说明：
//   id          URL 片段（/knowledge/:id）
//   era/eraSort 显示用的年代 & 排序用的数字（公元前写负数）
//   story       发现故事，按时间推进的分段
//   knowledge   知识点（Markdown + LaTeX，和物理模型 knowledge 同一套写法）
//   pitfalls    容易看错的地方
//   simulation  最后「实例化」的入口：modelId 指向经典模型，params 会写进分享链接
//   sources     参考资料（史实存疑的地方要在正文里说明是「记载」或「传说」）
//
// 目前先放 1 篇样板（单摆），确认风格后再按批次补。
export const PHENOMENA = [
    {
        id: "galileo-pendulum",
        era: "1583",
        eraSort: 1583,
        category: "力学",
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
]

export function getPhenomenonById(id) {
    return PHENOMENA.find(item => item.id === id) || null
}

/** 按年代排序后的列表，供时间轴使用 */
export const PHENOMENA_SORTED = [...PHENOMENA].sort((a, b) => a.eraSort - b.eraSort)

/** 知识小站首页的分类筛选项（从数据里自动汇总，不用手维护） */
export const PHENOMENA_CATEGORIES = ["全部", ...new Set(PHENOMENA.map(item => item.category))]

/** 某个经典模型关联的现象（模型页做反向链接用） */
export function getPhenomenaByModelId(modelId) {
    return PHENOMENA.filter(item => item.simulation?.modelId === modelId)
}
