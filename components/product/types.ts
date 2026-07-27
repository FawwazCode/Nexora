export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  price: number;
  originalPrice?: number;
  stock: number;
  featured: boolean;
};
