// Add completed element entries here. Empty entries stay on the data-only detail view.
export const ELEMENT_CONTENT = {}

// Copy this shape into ELEMENT_CONTENT and use the element symbol as its key.
export const ELEMENT_CONTENT_TEMPLATE = Object.freeze({
    intro: "",
    discovery: {
        year: "",
        title: "",
        text: "",
    },
    occurrence: "",
    narrative: "",
    applications: [
        { title: "", text: "" },
    ],
    reactions: [
        {
            equation: "",
            condition: "",
            phenomenon: "",
            meaning: "",
            safety: "",
        },
    ],
    question: "",
    source: {
        label: "",
        url: "",
    },
})
