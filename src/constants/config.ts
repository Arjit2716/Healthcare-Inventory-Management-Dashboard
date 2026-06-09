export const PRODUCT_CATEGORIES = [
  "Antibiotics",
  "Analgesics",
  "Cardiovascular",
  "Diabetes",
  "Vaccines",
  "Medical Supplies",
  "PPE",
  "Equipment",
  "Vitamins & Supplements",
  "Respiratory",
  "Gastrointestinal",
  "Dermatology",
  "Ophthalmology",
  "Other",
] as const;

export const PRODUCT_UNITS = [
  "tablets",
  "capsules",
  "vials",
  "ampoules",
  "bottles",
  "sachets",
  "patches",
  "pieces",
  "pairs",
  "boxes",
  "kits",
  "units",
  "ml",
  "mg",
  "g",
] as const;

export const LOW_STOCK_THRESHOLD_PERCENT = 0.3; // 30% of minStockLevel = critical
export const EXPIRY_WARNING_DAYS = 30;
export const EXPIRY_CRITICAL_DAYS = 7;
export const CACHE_TTL_SECONDS = 300;
export const PAGINATION_LIMIT = 20;
export const ACTIVITY_FEED_LIMIT = 10;
export const ANALYTICS_TREND_DAYS = 30;
