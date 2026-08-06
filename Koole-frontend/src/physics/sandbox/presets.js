export const SANDBOX_PRESETS = [
  {
    id: 'free-fall',
    name: '自由落体',
    description: '从固定高度释放小球，观察速度随时间的变化。',
    environment: {
      gravityEnabled: true,
      gravityStrength: 980,
      floorRestitution: 0,
    },
    camera: { centerX: 400, centerY: 330, scale: 1 },
    objects: [
      {
        modelId: 'ball',
        x: 400,
        y: 150,
        props: {
          radius: 20,
          mass: 1,
          restitution: 0.2,
          color: '#3498db',
          velocity: { x: 0, y: 0 },
          acceleration: { x: 0, y: 0 },
        },
      },
    ],
  },
  {
    id: 'inclined-slide',
    name: '斜面滑动',
    description: '物体从斜面高处释放，观察重力作用下的运动。',
    environment: {
      gravityEnabled: true,
      gravityStrength: 980,
      floorRestitution: 0,
    },
    camera: { centerX: 430, centerY: 390, scale: 1 },
    objects: [
      {
        modelId: 'ramp',
        x: 430,
        y: 520,
        props: {
          width: 280,
          height: 140,
          mass: 9999,
          isStatic: true,
          restitution: 0.25,
          color: '#27ae60',
          velocity: { x: 0, y: 0 },
          acceleration: { x: 0, y: 0 },
        },
      },
      {
        modelId: 'ball',
        x: 325,
        y: 430,
        props: {
          radius: 18,
          mass: 1,
          restitution: 0.15,
          color: '#f39c12',
          velocity: { x: 0, y: 0 },
          acceleration: { x: 0, y: 0 },
        },
      },
    ],
  },
]

export function getSandboxPreset(id) {
  return SANDBOX_PRESETS.find(preset => preset.id === id) || null
}
