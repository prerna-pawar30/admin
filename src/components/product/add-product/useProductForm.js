import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  ProductService, 
  BrandService, 
  CategoryService 
} from "../../../backend/ApiService"; 

const categoryNumberMap = {
  // "digital lab analog" : "1",
  // "scanbody": "2",
  // "screw": "3",
  // "abutment": "4",
  // "scanbridge scanbody": "5"
    "category 1" : "1",
  "category 2": "2",
  "category 3": "3",
  "category 4": "4",
  "category5": "5"
};

export const useProductForm = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryPrefix, setCategoryPrefix] = useState("");

  const [selectionSettings, setSelectionSettings] = useState({
    stockMode: "PRODUCT",
  });

  const [commonForm, setCommonForm] = useState({
    name: "",
    category: "",
    brand: [],
    material: "",
    shortDescription: "",
    descriptionSections: [{ text: "", images: [] }],
    status: "draft",
    seriesNumber: "",
    subSeriesNumber: "",
    sku: "",
    globalStock: "",
    globalPrice: "",
    globalImages: []
  });

  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [variants, setVariants] = useState([]);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allBrands, allCategories] = await Promise.all([
          BrandService.getAllBrands(),
          CategoryService.getCategories()
        ]);
        
        setBrands(allBrands.map(b => ({ value: b._id, label: b.brandName })));
        setCategories(allCategories || []);
      } catch (err) {
        console.error("Error loading form data", err);
      }
    };
    fetchData();
  }, []);

  // --- SKU GENERATION ---
  useEffect(() => {
    const s = commonForm.seriesNumber || "";
    const ss = commonForm.subSeriesNumber || "";
    setCommonForm(prev => ({
      ...prev,
      sku: categoryPrefix ? `${categoryPrefix}.${s}${ss}` : ""
    }));
  }, [categoryPrefix, commonForm.seriesNumber, commonForm.subSeriesNumber]);

  // --- HANDLERS ---
  const handleCategorySelection = (catId) => {
    const selected = categories.find(c => c._id === catId);
    if (selected) {
      setCategoryPrefix(categoryNumberMap[selected.name.toLowerCase()] || "0");
      setCommonForm(prev => ({ ...prev, category: catId }));
    }
  };

  const handleFileSelection = (e, variantId, type, descIdx = null) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (variantId === null) {
      if (type === 'globalImage') {
        setCommonForm(prev => ({ ...prev, globalImages: [...prev.globalImages, ...files] }));
      } else if (type === 'descImages') {
        const newSections = [...commonForm.descriptionSections];
        newSections[descIdx].images = [...(newSections[descIdx].images || []), ...files];
        setCommonForm(prev => ({ ...prev, descriptionSections: newSections }));
      }
    } else {
      setVariants(prev => prev.map(v => v.id === variantId ? { ...v, images: [...v.images, ...files] } : v));
    }
  };

  const addVariantRow = () => {
    setVariants([...variants, {
      id: Date.now(),
      variantName: "",
      price: "",
      stock: "",
      images: [],
      dynamicAttributes: [{ key: "", values: [""] }],
      settings: { priceMode: "PRODUCT", imageMode: "PRODUCT" }
    }]);
  };

  const updateVariant = (id, field, value) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const updateAttributeValue = (vId, aIdx, vIdx, val) => {
    setVariants(variants.map(v => {
      if (v.id === vId) {
        const newAttr = [...v.dynamicAttributes];
        newAttr[aIdx].values[vIdx] = val;
        return { ...v, dynamicAttributes: newAttr };
      }
      return v;
    }));
  };

  const addAttributeValue = (vId, aIdx) => {
    setVariants(variants.map(v => {
      if (v.id === vId) {
        const newAttr = [...v.dynamicAttributes];
        newAttr[aIdx].values.push("");
        return { ...v, dynamicAttributes: newAttr };
      }
      return v;
    }));
  };

  const removeAttributeValue = (vId, aIdx, vIdx) => {
    setVariants(variants.map(v => {
      if (v.id === vId) {
        const newAttr = [...v.dynamicAttributes];
        newAttr[aIdx].values = newAttr[aIdx].values.filter((_, i) => i !== vIdx);
        return { ...v, dynamicAttributes: newAttr };
      }
      return v;
    }));
  };

  const handleCreateProduct = async () => {
    setLoading(true);
    try {
      if (variants.length === 0) throw new Error("At least one variant is required");

      const formData = new FormData();
      
      // 1. APPEND PERMISSION FIRST (Fixes your current error)
      formData.append("permission", "product.listing.create");

      // 2. CORE FIELDS
      formData.append("name", commonForm.name);
      formData.append("sku", commonForm.sku);
      formData.append("category", commonForm.category);
      formData.append("status", commonForm.status);
      formData.append("shortDescription", commonForm.shortDescription);
      formData.append("stockType", selectionSettings.stockMode);
      formData.append("material", commonForm.material);
      formData.append("seriesNumber", commonForm.seriesNumber);
      formData.append("subSeriesNumber", commonForm.subSeriesNumber);
      formData.append("price", Number(commonForm.globalPrice || 0));

      // 3. BRAND MAPPING (Ensure IDs are sent, not objects)
      const brandIds = commonForm.brand.map(b => (typeof b === "object" ? b.value : b));
      formData.append("brand", JSON.stringify(brandIds));

      if (selectionSettings.stockMode === "PRODUCT") {
        formData.append("productStock", Number(commonForm.globalStock || 0));
      }

      // 4. SPECIFICATIONS
      const validSpecs = specifications
        .filter(s => s.key.trim() && s.value.trim())
        .map(s => ({ key: s.key, value: s.value }));
      formData.append("specification", JSON.stringify(validSpecs));

      // 5. GLOBAL IMAGES
      commonForm.globalImages.forEach(file => formData.append("productImages", file));

      // 6. DESCRIPTION SECTIONS & IMAGES
      const descriptionImageMap = [];
      const descriptionPayload = commonForm.descriptionSections.map((sec, i) => {
        sec.images?.forEach(file => {
          if (file instanceof File) {
            formData.append("descriptionImages", file);
            descriptionImageMap.push(i); // Map file to this paragraph index
          }
        });
        return { text: sec.text };
      });
      formData.append("descriptionImageMap", JSON.stringify(descriptionImageMap));
      formData.append("description", JSON.stringify(descriptionPayload));

      // 7. VARIANTS & VARIANT IMAGES
      const variantImageMap = [];
      const variantPayload = variants.map((v, i) => {
        v.images?.forEach(file => {
          if (file instanceof File) {
            formData.append("variantImages", file);
            variantImageMap.push(i); // Map file to this variant index
          }
        });

        return {
          name: v.variantName,
          sku: `${commonForm.sku}-${i}`,
          priceType: v.settings.priceMode,
          imageType: v.settings.imageMode,
          variantPrice: v.settings.priceMode === "VARIANT" ? Number(v.price) : undefined,
          variantStock: Number(v.stock || 0),
          stockType: selectionSettings.stockMode,
          attributes: v.dynamicAttributes
            .filter(a => a.key.trim())
            .map(a => ({
              key: a.key,
              value: a.values.filter(val => val.trim()) // Corrected key name to 'value'
            })),
        };
      });

      formData.append("variantImageMap", JSON.stringify(variantImageMap));
      formData.append("variants", JSON.stringify(variantPayload));

      // 8. FINAL SUBMISSION
      await ProductService.createProduct(formData);

      Swal.fire({
        icon: "success",
        title: "Product Created",
        text: "The product has been successfully added to Digident inventory.",
        confirmButtonColor: "#E68736",
      });
      
    } catch (err) {
      console.error("Submission Error:", err);
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    brands, categories, loading, selectionSettings, setSelectionSettings,
    commonForm, setCommonForm, specifications, setSpecifications, variants, setVariants,
    handleCategorySelection, handleFileSelection, addVariantRow, updateVariant,
    updateAttributeValue, addAttributeValue, removeAttributeValue, handleCreateProduct
  };
};