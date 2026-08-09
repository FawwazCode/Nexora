export type Product = {
  id: string;
  variantId?: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  price: number;
  originalPrice?: number;
  stock: number;
  featured: boolean;
  description?: string;
  shortDescription?: string | null;
  brandName?: string;
};
