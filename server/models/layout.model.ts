import { Schema, model, Document } from "mongoose";

// Interface for a single FAQ item
interface FaqItem {
    question: string;
    answer: string;
}

// Interface for a single Category item
interface CategoryItem {
    title: string;
}

// Interface for banner image
interface BannerImage {
    public_id: string;
    url: string;
}

// Layout Document Interface
interface Layout extends Document {
    type: string;
    faq: FaqItem[];
    categories: CategoryItem[];
    banner: {
        image: BannerImage;
        title: string;
        subTitle: string;
    };
}

// FAQ sub-schema
const faqSchema = new Schema<FaqItem>({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});

// Category sub-schema
const categorySchema = new Schema<CategoryItem>({
    title: { type: String, required: true },
});

// Banner image sub-schema
const bannerImageSchema = new Schema<BannerImage>({
    public_id: { type: String, required: true },
    url: { type: String, required: true },
});

// Main layout schema
const layoutSchema = new Schema<Layout>({
    type: { type: String, required: true },
    faq: [faqSchema],
    categories: [categorySchema],
    banner: {
        image: bannerImageSchema,
        title: { type: String, required: true },
        subTitle: { type: String, required: true },
    },
});

const LayoutModel = model<Layout>("Layout", layoutSchema);
export default LayoutModel;
