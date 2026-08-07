const rows = `
1|H|氢|Hydrogen|1.008|1|1|1
2|He|氦|Helium|4.0026|1|18|2
3|Li|锂|Lithium|6.94|2|1|2-1
4|Be|铍|Beryllium|9.0122|2|2|2-2
5|B|硼|Boron|10.81|2|13|2-3
6|C|碳|Carbon|12.011|2|14|2-4
7|N|氮|Nitrogen|14.007|2|15|2-5
8|O|氧|Oxygen|15.999|2|16|2-6
9|F|氟|Fluorine|18.998|2|17|2-7
10|Ne|氖|Neon|20.180|2|18|2-8
11|Na|钠|Sodium|22.990|3|1|2-8-1
12|Mg|镁|Magnesium|24.305|3|2|2-8-2
13|Al|铝|Aluminium|26.982|3|13|2-8-3
14|Si|硅|Silicon|28.085|3|14|2-8-4
15|P|磷|Phosphorus|30.974|3|15|2-8-5
16|S|硫|Sulfur|32.06|3|16|2-8-6
17|Cl|氯|Chlorine|35.45|3|17|2-8-7
18|Ar|氩|Argon|39.948|3|18|2-8-8
19|K|钾|Potassium|39.098|4|1|2-8-8-1
20|Ca|钙|Calcium|40.078|4|2|2-8-8-2
21|Sc|钪|Scandium|44.956|4|3|2-8-9-2
22|Ti|钛|Titanium|47.867|4|4|2-8-10-2
23|V|钒|Vanadium|50.942|4|5|2-8-11-2
24|Cr|铬|Chromium|51.996|4|6|2-8-13-1
25|Mn|锰|Manganese|54.938|4|7|2-8-13-2
26|Fe|铁|Iron|55.845|4|8|2-8-14-2
27|Co|钴|Cobalt|58.933|4|9|2-8-15-2
28|Ni|镍|Nickel|58.693|4|10|2-8-16-2
29|Cu|铜|Copper|63.546|4|11|2-8-18-1
30|Zn|锌|Zinc|65.38|4|12|2-8-18-2
31|Ga|镓|Gallium|69.723|4|13|2-8-18-3
32|Ge|锗|Germanium|72.630|4|14|2-8-18-4
33|As|砷|Arsenic|74.922|4|15|2-8-18-5
34|Se|硒|Selenium|78.971|4|16|2-8-18-6
35|Br|溴|Bromine|79.904|4|17|2-8-18-7
36|Kr|氪|Krypton|83.798|4|18|2-8-18-8
37|Rb|铷|Rubidium|85.468|5|1|2-8-18-8-1
38|Sr|锶|Strontium|87.62|5|2|2-8-18-8-2
39|Y|钇|Yttrium|88.906|5|3|2-8-18-9-2
40|Zr|锆|Zirconium|91.224|5|4|2-8-18-10-2
41|Nb|铌|Niobium|92.906|5|5|2-8-18-12-1
42|Mo|钼|Molybdenum|95.95|5|6|2-8-18-13-1
43|Tc|锝|Technetium|[98]|5|7|2-8-18-13-2
44|Ru|钌|Ruthenium|101.07|5|8|2-8-18-15-1
45|Rh|铑|Rhodium|102.91|5|9|2-8-18-16-1
46|Pd|钯|Palladium|106.42|5|10|2-8-18-18
47|Ag|银|Silver|107.87|5|11|2-8-18-18-1
48|Cd|镉|Cadmium|112.41|5|12|2-8-18-18-2
49|In|铟|Indium|114.82|5|13|2-8-18-18-3
50|Sn|锡|Tin|118.71|5|14|2-8-18-18-4
51|Sb|锑|Antimony|121.76|5|15|2-8-18-18-5
52|Te|碲|Tellurium|127.60|5|16|2-8-18-18-6
53|I|碘|Iodine|126.90|5|17|2-8-18-18-7
54|Xe|氙|Xenon|131.29|5|18|2-8-18-18-8
55|Cs|铯|Caesium|132.91|6|1|2-8-18-18-8-1
56|Ba|钡|Barium|137.33|6|2|2-8-18-18-8-2
57|La|镧|Lanthanum|138.91|6|3|2-8-18-18-9-2
58|Ce|铈|Cerium|140.12|6|0|2-8-18-19-9-2
59|Pr|镨|Praseodymium|140.91|6|0|2-8-18-21-8-2
60|Nd|钕|Neodymium|144.24|6|0|2-8-18-22-8-2
61|Pm|钷|Promethium|[145]|6|0|2-8-18-23-8-2
62|Sm|钐|Samarium|150.36|6|0|2-8-18-24-8-2
63|Eu|铕|Europium|151.96|6|0|2-8-18-25-8-2
64|Gd|钆|Gadolinium|157.25|6|0|2-8-18-25-9-2
65|Tb|铽|Terbium|158.93|6|0|2-8-18-27-8-2
66|Dy|镝|Dysprosium|162.50|6|0|2-8-18-28-8-2
67|Ho|钬|Holmium|164.93|6|0|2-8-18-29-8-2
68|Er|铒|Erbium|167.26|6|0|2-8-18-30-8-2
69|Tm|铥|Thulium|168.93|6|0|2-8-18-31-8-2
70|Yb|镱|Ytterbium|173.05|6|0|2-8-18-32-8-2
71|Lu|镥|Lutetium|174.97|6|3|2-8-18-32-9-2
72|Hf|铪|Hafnium|178.49|6|4|2-8-18-32-10-2
73|Ta|钽|Tantalum|180.95|6|5|2-8-18-32-11-2
74|W|钨|Tungsten|183.84|6|6|2-8-18-32-12-2
75|Re|铼|Rhenium|186.21|6|7|2-8-18-32-13-2
76|Os|锇|Osmium|190.23|6|8|2-8-18-32-14-2
77|Ir|铱|Iridium|192.22|6|9|2-8-18-32-15-2
78|Pt|铂|Platinum|195.08|6|10|2-8-18-32-17-1
79|Au|金|Gold|196.97|6|11|2-8-18-32-18-1
80|Hg|汞|Mercury|200.59|6|12|2-8-18-32-18-2
81|Tl|铊|Thallium|204.38|6|13|2-8-18-32-18-3
82|Pb|铅|Lead|207.2|6|14|2-8-18-32-18-4
83|Bi|铋|Bismuth|208.98|6|15|2-8-18-32-18-5
84|Po|钋|Polonium|[209]|6|16|2-8-18-32-18-6
85|At|砹|Astatine|[210]|6|17|2-8-18-32-18-7
86|Rn|氡|Radon|[222]|6|18|2-8-18-32-18-8
87|Fr|钫|Francium|[223]|7|1|2-8-18-32-18-8-1
88|Ra|镭|Radium|[226]|7|2|2-8-18-32-18-8-2
89|Ac|锕|Actinium|[227]|7|3|2-8-18-32-18-9-2
90|Th|钍|Thorium|232.04|7|0|2-8-18-32-18-10-2
91|Pa|镤|Protactinium|231.04|7|0|2-8-18-32-20-9-2
92|U|铀|Uranium|238.03|7|0|2-8-18-32-21-9-2
93|Np|镎|Neptunium|[237]|7|0|2-8-18-32-22-9-2
94|Pu|钚|Plutonium|[244]|7|0|2-8-18-32-24-8-2
95|Am|镅|Americium|[243]|7|0|2-8-18-32-25-8-2
96|Cm|锔|Curium|[247]|7|0|2-8-18-32-25-9-2
97|Bk|锫|Berkelium|[247]|7|0|2-8-18-32-27-8-2
98|Cf|锎|Californium|[251]|7|0|2-8-18-32-28-8-2
99|Es|锿|Einsteinium|[252]|7|0|2-8-18-32-29-8-2
100|Fm|镄|Fermium|[257]|7|0|2-8-18-32-30-8-2
101|Md|钔|Mendelevium|[258]|7|0|2-8-18-32-31-8-2
102|No|锘|Nobelium|[259]|7|0|2-8-18-32-32-8-2
103|Lr|铹|Lawrencium|[266]|7|3|2-8-18-32-32-8-3
104|Rf|𬬻|Rutherfordium|[267]|7|4|2-8-18-32-32-10-2
105|Db|𬭊|Dubnium|[268]|7|5|2-8-18-32-32-11-2
106|Sg|𬭳|Seaborgium|[269]|7|6|2-8-18-32-32-12-2
107|Bh|𬭛|Bohrium|[270]|7|7|2-8-18-32-32-13-2
108|Hs|𬭶|Hassium|[277]|7|8|2-8-18-32-32-14-2
109|Mt|鿏|Meitnerium|[278]|7|9|2-8-18-32-32-15-2
110|Ds|𫟼|Darmstadtium|[281]|7|10|2-8-18-32-32-17-1
111|Rg|𬬭|Roentgenium|[282]|7|11|2-8-18-32-32-18-1
112|Cn|鿔|Copernicium|[285]|7|12|2-8-18-32-32-18-2
113|Nh|鉨|Nihonium|[286]|7|13|2-8-18-32-32-18-3
114|Fl|鈇|Flerovium|[289]|7|14|2-8-18-32-32-18-4
115|Mc|镆|Moscovium|[290]|7|15|2-8-18-32-32-18-5
116|Lv|鉝|Livermorium|[293]|7|16|2-8-18-32-32-18-6
117|Ts|鿬|Tennessine|[294]|7|17|2-8-18-32-32-18-7
118|Og|鿫|Oganesson|[294]|7|18|2-8-18-32-32-18-8
`.trim().split("\n")

const alkali = new Set([3, 11, 19, 37, 55, 87])
const alkaline = new Set([4, 12, 20, 38, 56, 88])
const metalloids = new Set([5, 14, 32, 33, 51, 52])
const nonmetals = new Set([1, 6, 7, 8, 15, 16, 34])
const postTransition = new Set([13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116])
const gases = new Set([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86])
const liquids = new Set([35, 80])

function categoryFor(number, group) {
    if (number >= 57 && number <= 71) return "lanthanide"
    if (number >= 89 && number <= 103) return "actinide"
    if (alkali.has(number)) return "alkali-metal"
    if (alkaline.has(number)) return "alkaline-earth"
    if (group >= 3 && group <= 12) return "transition-metal"
    if (group === 17) return "halogen"
    if (group === 18) return "noble-gas"
    if (metalloids.has(number)) return "metalloid"
    if (nonmetals.has(number)) return "nonmetal"
    if (postTransition.has(number)) return "post-transition"
    return "unknown"
}

function blockFor(number, group) {
    if ((number >= 57 && number <= 71) || (number >= 89 && number <= 103)) return "f"
    if (group <= 2) return "s"
    if (group >= 13) return "p"
    return "d"
}

function positionFor(number, period, group) {
    if (number >= 58 && number <= 71) return { row: 9, column: number - 54, series: "lanthanide" }
    if (number >= 90 && number <= 103) return { row: 10, column: number - 86, series: "actinide" }
    return { row: period, column: group || 3, series: null }
}

export const ELEMENT_CATEGORIES = {
    "alkali-metal": { label: "碱金属", color: "#e97979" },
    "alkaline-earth": { label: "碱土金属", color: "#e5a85d" },
    "transition-metal": { label: "过渡金属", color: "#e5c35d" },
    "post-transition": { label: "后过渡金属", color: "#87b8a4" },
    metalloid: { label: "类金属", color: "#62b6a0" },
    nonmetal: { label: "非金属", color: "#5da7d8" },
    halogen: { label: "卤素", color: "#8d91df" },
    "noble-gas": { label: "稀有气体", color: "#b281d5" },
    lanthanide: { label: "镧系元素", color: "#df8fb4" },
    actinide: { label: "锕系元素", color: "#c681a7" },
    unknown: { label: "性质未定", color: "#9aa3aa" },
}

export const ELEMENT_PHASES = {
    solid: "固态",
    liquid: "液态",
    gas: "气态",
    unknown: "未知",
}

const physicalData = {
    H: [-259.16, -252.87, 0.0000899, 2.20], He: [-272.20, -268.93, 0.0001785, null],
    C: [3550, 4027, 2.267, 2.55], N: [-210.00, -195.79, 0.001251, 3.04], O: [-218.79, -182.95, 0.001429, 3.44],
    Na: [97.79, 883, 0.968, 0.93], Mg: [650, 1091, 1.738, 1.31], Al: [660.32, 2519, 2.70, 1.61],
    Si: [1414, 3265, 2.329, 1.90], P: [44.15, 280.5, 1.82, 2.19], S: [115.21, 444.72, 2.067, 2.58],
    Cl: [-101.5, -34.04, 0.003214, 3.16], K: [63.38, 759, 0.862, 0.82], Ca: [842, 1484, 1.55, 1.00],
    Fe: [1538, 2862, 7.874, 1.83], Cu: [1084.62, 2562, 8.96, 1.90], Zn: [419.53, 907, 7.14, 1.65],
    Br: [-7.2, 58.8, 3.1028, 2.96], Ag: [961.78, 2162, 10.49, 1.93], I: [113.7, 184.3, 4.933, 2.66],
    Au: [1064.18, 2856, 19.32, 2.54], Hg: [-38.83, 356.73, 13.534, 2.00], Pb: [327.46, 1749, 11.34, 2.33],
    U: [1132.2, 4131, 19.1, 1.38],
}

export const PERIODIC_ELEMENTS = rows.map(row => {
    const [numberText, symbol, name, englishName, atomicMass, periodText, groupText, shellsText] = row.split("|")
    const atomicNumber = Number(numberText)
    const period = Number(periodText)
    const group = Number(groupText)
    const shells = shellsText.split("-").map(Number)
    const category = categoryFor(atomicNumber, group)
    const physics = physicalData[symbol] || [null, null, null, null]
    const phase = gases.has(atomicNumber) ? "gas" : liquids.has(atomicNumber) ? "liquid" : atomicNumber >= 104 ? "unknown" : "solid"
    return {
        atomicNumber,
        symbol,
        name,
        englishName,
        atomicMass,
        period,
        group: group || null,
        block: blockFor(atomicNumber, group),
        category,
        phase,
        electronConfiguration: shells.join("、"),
        shells,
        valenceElectrons: shells[shells.length - 1],
        commonOxidationStates: null,
        meltingPoint: physics[0],
        boilingPoint: physics[1],
        density: physics[2],
        electronegativity: physics[3],
        position: positionFor(atomicNumber, period, group),
    }
})

export function getElementBySymbol(symbol) {
    const key = String(symbol || "").toLowerCase()
    return PERIODIC_ELEMENTS.find(element => element.symbol.toLowerCase() === key) || null
}

export function getElementByAtomicNumber(number) {
    return PERIODIC_ELEMENTS.find(element => element.atomicNumber === Number(number)) || null
}
