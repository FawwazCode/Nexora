"use client";

import { useEffect, useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Check,
  ChevronsUpDown,
  X,
  Loader2,
  DollarSign,
  Package,
  Layers,
  Tag,
  Sparkles,
  Eye,
  Upload,
  AlertCircle,
} from "lucide-react";

type CategoryOption = {
  id: string;
  name: string;
  slug?: string;
};

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  isFeatured: boolean;
  isPublished: boolean;
  sku: string;
  price: number;
  stock: number;
  color: string;
  ram: string;
  storage: string;
  barcode: string;
  thumbnail: string;
};

type ProductFormProps = {
  initialValues?: Partial<ProductFormValues> | null;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
};

const defaultValues: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  brandName: "",
  categoryId: "",
  categoryName: "",
  isFeatured: false,
  isPublished: false,
  sku: "",
  price: 0,
  stock: 0,
  color: "Default",
  ram: "8GB",
  storage: "256GB",
  barcode: "",
  thumbnail: "",
};

export function ProductForm({
  initialValues,
  submitting = false,
  submitLabel = "Save product",
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(defaultValues);
  const [preview, setPreview] = useState<string>("");

  // String state for smooth typing of Price and Stock without zero-snapping
  const [priceInput, setPriceInput] = useState<string>("");
  const [stockInput, setStockInput] = useState<string>("");

  // Database Categories State
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Category Search Combobox State
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-slug tracking
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(false);

  // Form Field Error Messages
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch Categories from database API
  useEffect(() => {
    const fetchCategoriesFromDatabase = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const response = await fetch("/api/admin/categories?page=1&pageSize=50");

        if (!response.ok) {
          let errorDetail = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errJson = await response.json();
            if (errJson?.message) {
              const msgText = typeof errJson.message === "string" 
                ? errJson.message 
                : JSON.stringify(errJson.message);
              errorDetail += ` - ${msgText}`;
            }
          } catch {
            // ignore JSON parse failure for error body
          }
          throw new Error(`Failed to load categories: ${errorDetail}`);
        }

        const data = await response.json();
        const categoryItems: CategoryOption[] = Array.isArray(data?.items) ? data.items : [];
        setCategories(categoryItems);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Could not load categories from database";
        console.error("Error loading categories from database:", errorMsg);
        setCategoriesError(errorMsg);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategoriesFromDatabase();
  }, []);

  // Sync initialValues when editing existing product
  useEffect(() => {
    if (!initialValues) return;

    const priceNum = Number(initialValues.price ?? 0);
    const stockNum = Number(initialValues.stock ?? 0);

    const nextValues: ProductFormValues = {
      ...defaultValues,
      ...initialValues,
      price: priceNum,
      stock: stockNum,
      color: initialValues.color || "Default",
      ram: initialValues.ram || "8GB",
      storage: initialValues.storage || "256GB",
    };

    setValues(nextValues);
    setPriceInput(priceNum > 0 ? priceNum.toString() : "");
    setStockInput(stockNum >= 0 ? stockNum.toString() : "0");
    setPreview(initialValues.thumbnail ?? "");
    if (initialValues.slug) {
      setIsSlugManuallyEdited(true);
    }
  }, [initialValues]);

  // Close Category Dropdown on Outside Click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto Generate Slug from Name
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValues((prev) => {
      const updated = { ...prev, name };
      if (!isSlugManuallyEdited) {
        const autoSlug = name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
        updated.slug = autoSlug;
      }
      return updated;
    });

    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    const slug = e.target.value;
    setValues((prev) => ({ ...prev, slug }));
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: "" }));
    }
  };

  // TASK 1: Price Input Handler - smooth manual typing for numbers/decimals like 9, 99, 999.99, 1500
  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    // Allow empty string while typing
    if (inputVal === "") {
      setPriceInput("");
      setValues((prev) => ({ ...prev, price: 0 }));
      return;
    }

    // Only allow non-negative numbers and max 1 decimal dot
    const validDecimalRegex = /^\d*\.?\d{0,2}$/;
    if (!validDecimalRegex.test(inputVal)) {
      return;
    }

    setPriceInput(inputVal);
    const parsed = parseFloat(inputVal);
    if (!isNaN(parsed) && parsed >= 0) {
      setValues((prev) => ({ ...prev, price: parsed }));
      if (errors.price) {
        setErrors((prev) => ({ ...prev, price: "" }));
      }
    }
  };

  // TASK 2: Stock Input Handler - smooth manual typing for integers like 0, 1, 15, 100
  const handleStockChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    // Allow empty string while typing
    if (inputVal === "") {
      setStockInput("");
      setValues((prev) => ({ ...prev, stock: 0 }));
      return;
    }

    // Only allow positive integers or zero
    const validIntegerRegex = /^\d+$/;
    if (!validIntegerRegex.test(inputVal)) {
      return;
    }

    setStockInput(inputVal);
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setValues((prev) => ({ ...prev, stock: parsed }));
      if (errors.stock) {
        setErrors((prev) => ({ ...prev, stock: "" }));
      }
    }
  };

  // TASK 3: Database Category Selection Handlers
  const handleSelectCategory = (category: CategoryOption) => {
    setValues((prev) => ({
      ...prev,
      categoryId: category.id,
      categoryName: category.name,
    }));
    setIsCategoryDropdownOpen(false);
    setCategorySearchQuery("");
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
  };

  const handleClearCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValues((prev) => ({
      ...prev,
      categoryId: "",
      categoryName: "",
    }));
  };

  // Image Upload Handler
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setPreview(result);
      setValues((prev) => ({ ...prev, thumbnail: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreview("");
    setValues((prev) => ({ ...prev, thumbnail: "" }));
  };

  // Filter Categories fetched from DB by Search Query
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearchQuery.trim().toLowerCase())
  );

  // Form Submit Handler & Client Validations
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!values.name.trim() || values.name.trim().length < 2) {
      newErrors.name = "Product name must be at least 2 characters.";
    }

    if (!values.slug.trim() || values.slug.trim().length < 2) {
      newErrors.slug = "Slug must be at least 2 characters.";
    }

    if (!values.description.trim() || values.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    }

    if (!values.sku.trim()) {
      newErrors.sku = "SKU is required.";
    }

    if (values.price < 0 || isNaN(values.price)) {
      newErrors.price = "Price must be a valid non-negative number.";
    }

    if (values.stock < 0 || isNaN(values.stock) || !Number.isInteger(values.stock)) {
      newErrors.stock = "Stock must be a valid non-negative integer.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      ...values,
      price: Number(values.price),
      stock: Number(values.stock),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SECTION 1: BASIC INFORMATION */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Package className="w-5 h-5 text-[#7F46FA]" />
          <h3 className="font-bold text-gray-900 text-base">Basic Product Information</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Product Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold uppercase text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              required
              placeholder="e.g. iPhone 15 Pro Max 256GB"
              value={values.name}
              onChange={handleNameChange}
              className={`transition ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-xs font-semibold uppercase text-gray-700">
              Slug Identifier <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              required
              placeholder="e.g. iphone-15-pro-max-256gb"
              value={values.slug}
              onChange={handleSlugChange}
              className={`font-mono text-xs transition ${errors.slug ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {errors.slug ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.slug}
              </p>
            ) : (
              <p className="text-[11px] text-gray-400">URL-friendly unique handle.</p>
            )}
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-1.5">
          <Label htmlFor="shortDescription" className="text-xs font-semibold uppercase text-gray-700">
            Short Tagline / Highlight Summary
          </Label>
          <Input
            id="shortDescription"
            placeholder="e.g. Supercharged by A17 Pro chip with titanium design"
            value={values.shortDescription}
            onChange={(e) => setValues((prev) => ({ ...prev, shortDescription: e.target.value }))}
          />
        </div>

        {/* Full Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-semibold uppercase text-gray-700">
            Full Description <span className="text-red-500">*</span>
          </Label>
          <textarea
            id="description"
            required
            rows={4}
            placeholder="Provide a comprehensive description of features, specs, and package contents..."
            value={values.description}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, description: e.target.value }));
              if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
            }}
            className={`w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F46FA] transition ${
              errors.description ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.description}
            </p>
          )}
        </div>
      </div>

      {/* SECTION 2: PRICING & INVENTORY */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-gray-900 text-base">Pricing & Inventory Stock</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* TASK 1: Price Input - Manual Typing */}
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs font-semibold uppercase text-gray-700">
              Selling Price ($) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                $
              </span>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                required
                placeholder="0.00"
                value={priceInput}
                onChange={handlePriceChange}
                onWheel={(e) => e.currentTarget.blur()}
                className={`pl-7 font-mono text-base font-bold transition ${
                  errors.price ? "border-red-500 focus:ring-red-500" : ""
                }`}
              />
            </div>
            {errors.price ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.price}
              </p>
            ) : (
              <p className="text-[11px] text-gray-400">Type nominal price (e.g. 99.99 or 1500).</p>
            )}
          </div>

          {/* TASK 2: Stock Input - Manual Typing */}
          <div className="space-y-1.5">
            <Label htmlFor="stock" className="text-xs font-semibold uppercase text-gray-700">
              Initial Stock Quantity <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="stock"
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={stockInput}
                onChange={handleStockChange}
                onWheel={(e) => e.currentTarget.blur()}
                className={`font-mono text-base font-bold transition ${
                  errors.stock ? "border-red-500 focus:ring-red-500" : ""
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                units
              </span>
            </div>
            {errors.stock ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.stock}
              </p>
            ) : (
              <p className="text-[11px] text-gray-400">Type physical units count (e.g. 15 or 100).</p>
            )}
          </div>

          {/* SKU */}
          <div className="space-y-1.5">
            <Label htmlFor="sku" className="text-xs font-semibold uppercase text-gray-700">
              SKU Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sku"
              required
              placeholder="e.g. APP-IPH15-256"
              value={values.sku}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, sku: e.target.value }));
                if (errors.sku) setErrors((prev) => ({ ...prev, sku: "" }));
              }}
              className={`font-mono text-xs transition ${errors.sku ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {errors.sku && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.sku}
              </p>
            )}
          </div>

          {/* Barcode */}
          <div className="space-y-1.5">
            <Label htmlFor="barcode" className="text-xs font-semibold uppercase text-gray-700">
              Barcode / EAN (Optional)
            </Label>
            <Input
              id="barcode"
              placeholder="e.g. 194253098123"
              value={values.barcode}
              onChange={(e) => setValues((prev) => ({ ...prev, barcode: e.target.value }))}
              className="font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: DATABASE CATEGORY & BRAND */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900 text-base">Category & Brand Classification</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* TASK 3: Searchable Database Category Combobox */}
          <div className="space-y-1.5 relative" ref={categoryDropdownRef}>
            <Label className="text-xs font-semibold uppercase text-gray-700">
              Product Category (From Database) <span className="text-red-500">*</span>
            </Label>

            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 transition hover:border-[#7F46FA] focus:outline-none focus:ring-2 focus:ring-[#7F46FA] ${
                values.categoryId ? "border-indigo-300 bg-indigo-50/20" : ""
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                {values.categoryName ? (
                  <span className="font-semibold text-gray-900">{values.categoryName}</span>
                ) : (
                  <span className="text-gray-400">Select category from database...</span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {values.categoryName && (
                  <span
                    onClick={handleClearCategory}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-md transition"
                    title="Clear selection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
                <ChevronsUpDown className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* Search Dropdown Popover */}
            {isCategoryDropdownOpen && (
              <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Search Input Bar */}
                <div className="p-2 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  <input
                    type="text"
                    placeholder="Search database category..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 text-sm focus:outline-none py-1.5 text-gray-900 placeholder:text-gray-400"
                    autoFocus
                  />
                  {categorySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCategorySearchQuery("")}
                      className="p-1 text-gray-400 hover:text-gray-600 mr-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown Options List */}
                <div className="max-h-56 overflow-y-auto p-1 divide-y divide-gray-50">
                  {categoriesLoading ? (
                    <div className="py-6 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#7F46FA]" />
                      <span>Loading categories from database...</span>
                    </div>
                  ) : categoriesError ? (
                    <div className="p-4 text-center text-xs text-red-500 flex flex-col items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{categoriesError}</span>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-500">
                      <p className="font-semibold text-gray-700">No categories available in database</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Please create a category first.</p>
                    </div>
                  ) : filteredCategories.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-500">
                      <p className="font-medium text-gray-700">No category found</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Matching query &quot;{categorySearchQuery}&quot;
                      </p>
                    </div>
                  ) : (
                    filteredCategories.map((cat) => {
                      const isSelected = values.categoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategory(cat)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition text-left ${
                            isSelected
                              ? "bg-indigo-50 font-bold text-indigo-900"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Tag className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-600" : "text-gray-400"}`} />
                            <span>{cat.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <p className="text-[11px] text-gray-400">
              Only categories existing in database are displayed.
            </p>
          </div>

          {/* Brand Name */}
          <div className="space-y-1.5">
            <Label htmlFor="brandName" className="text-xs font-semibold uppercase text-gray-700">
              Brand / Manufacturer Name
            </Label>
            <Input
              id="brandName"
              placeholder="e.g. Apple, Samsung, Sony, Nexora"
              value={values.brandName}
              onChange={(e) => setValues((prev) => ({ ...prev, brandName: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: SPECIFICATIONS & VARIANTS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-gray-900 text-base">Variant Attributes & Specs</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="color" className="text-xs font-semibold uppercase text-gray-700">
              Color Variant
            </Label>
            <Input
              id="color"
              placeholder="e.g. Space Black, Titanium"
              value={values.color}
              onChange={(e) => setValues((prev) => ({ ...prev, color: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ram" className="text-xs font-semibold uppercase text-gray-700">
              RAM Memory
            </Label>
            <Input
              id="ram"
              placeholder="e.g. 8GB, 16GB"
              value={values.ram}
              onChange={(e) => setValues((prev) => ({ ...prev, ram: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="storage" className="text-xs font-semibold uppercase text-gray-700">
              Internal Storage
            </Label>
            <Input
              id="storage"
              placeholder="e.g. 256GB, 512GB, 1TB"
              value={values.storage}
              onChange={(e) => setValues((prev) => ({ ...prev, storage: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: MEDIA & THUMBNAIL */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Upload className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 text-base">Product Image & Media</h3>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 bg-gray-50/50 text-center hover:bg-gray-50 transition">
          {preview ? (
            <div className="relative max-w-sm mx-auto rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
              <img src={preview} alt="Product Preview" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#7F46FA] flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Upload Product Image</p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 cursor-pointer transition">
                <span>Browse Files</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 6: VISIBILITY & STATUS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Eye className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-900 text-base">Visibility & Store Placement</h3>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-gray-800">
            <input
              type="checkbox"
              checked={values.isPublished}
              onChange={(e) => setValues((prev) => ({ ...prev, isPublished: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-[#7F46FA] focus:ring-[#7F46FA]"
            />
            <span>Publish to Store Catalog</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-gray-800">
            <input
              type="checkbox"
              checked={values.isFeatured}
              onChange={(e) => setValues((prev) => ({ ...prev, isFeatured: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-[#7F46FA] focus:ring-[#7F46FA]"
            />
            <span>Feature on Home Showcase</span>
          </label>
        </div>
      </div>

      {/* SECTION 7: ACTION BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={submitting}
          className="px-5"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={submitting}
          className="bg-[#7F46FA] hover:bg-[#6D3BE3] text-white min-w-[140px] px-6 shadow-md"
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
