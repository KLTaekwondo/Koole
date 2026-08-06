import cellIcon from "../assets/icons/cell.svg?raw"
import dnaIcon from "../assets/icons/dna.svg?raw"
import neuronIcon from "../assets/icons/neuron.svg?raw"

export const BIOLOGY_MODELS = [
    {
        id: "cell",
        name: "细胞结构",
        short: "细胞膜、细胞核、线粒体",
        desc: "用半透明外壳表示细胞膜，把细胞核、线粒体和一些小颗粒放在内部，先看整体层次。",
        points: ["细胞膜像一层边界", "细胞核位于内部偏中心", "细胞器分布在细胞质里"],
        tip: "旋转时可以看到透明细胞膜包住内部结构，这种层次感在 2D 图里不太明显。",
        icon: cellIcon,
    },
    {
        id: "dna",
        name: "DNA 双螺旋",
        short: "两条骨架和中间碱基对",
        desc: "用两条螺旋线表示 DNA 骨架，中间用短杆连接，像一架扭起来的梯子。",
        points: ["两条螺旋骨架互相缠绕", "中间短杆表示碱基对", "整体结构沿轴向周期重复"],
        tip: "从侧面看像波浪，从上方看能看到两条链绕着同一条轴转。",
        icon: dnaIcon,
    },
    {
        id: "neuron",
        name: "神经元",
        short: "细胞体、树突、轴突",
        desc: "用中心球体表示细胞体，周围伸出树突和一条较长轴突，先把神经元的外形抓住。",
        points: ["细胞体是主体", "树突像分叉的小树枝", "轴突更长，负责把信号传出去"],
        tip: "神经元不是一根线，而是一个主体加很多分支，这个 3D 模型能看得更清楚。",
        icon: neuronIcon,
    },
]
