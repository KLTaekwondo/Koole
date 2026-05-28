export const PHYSICS_MODELS = [
    {
        id: "free-fall",
        name: "自由落体",
        desc: "物体在重力作用下的竖直下落",
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="12"/><path d="M12 12l-3 3"/><path d="M12 12l3 3"/><circle cx="12" cy="18" r="3"/></svg>`,
        params: [
            { key: "height", label: "初始高度 (m)", type: "range", value: 10, min: 1, max: 50, step: 0.5 },
            { key: "gravity", label: "重力加速度 (m/s²)", type: "range", value: 9.8, min: 1, max: 20, step: 0.1 },
        ],
    },
]

export const DRAW_SCALE = 30 // 像素/米
