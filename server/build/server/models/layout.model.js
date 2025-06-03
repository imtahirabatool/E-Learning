"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// FAQ sub-schema
const faqSchema = new mongoose_1.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});
// Category sub-schema
const categorySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
});
// Banner image sub-schema
const bannerImageSchema = new mongoose_1.Schema({
    public_id: { type: String, required: true },
    url: { type: String, required: true },
});
// Main layout schema
const layoutSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    faq: [faqSchema],
    categories: [categorySchema],
    banner: {
        image: bannerImageSchema,
        title: { type: String, required: true },
        subTitle: { type: String, required: true },
    },
});
const LayoutModel = (0, mongoose_1.model)("Layout", layoutSchema);
exports.default = LayoutModel;
