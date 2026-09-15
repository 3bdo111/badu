export interface Review {
  id: string;
  author: string;
  /** 1–5 */
  rating: number;
  text: {
    en: string;
    ar: string;
  };
  date: string;
  verified: boolean;
  location?: {
    en: string;
    ar: string;
  };
  sizePurchased?: string;
}
