/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useProductForm } from "./useProductForm";
import BasicInfoSection from "./BasicInfoSection";
import DescriptionSection from "./DescriptionSection";
import SpecificationsSection from "./SpecificationsSection";
import VariantSection from "./VariantSection";
import SummarySidebar from "./SummarySidebar";

export default function AddProduct() {
  const {
    brands, categories, loading, selectionSettings, setSelectionSettings,
    commonForm, setCommonForm, specifications, setSpecifications, variants, setVariants,
    handleCategorySelection, handleFileSelection, addVariantRow, updateVariant,
    updateAttributeValue, addAttributeValue, removeAttributeValue, handleCreateProduct
  } = useProductForm();

  return (
    <div className="min-h-screen bg-gray-50 pb-16 px-3 sm:px-5 md:px-8 pt-6 font-sans antialiased">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Add new product</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details below to add a product to your inventory.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main form — 2/3 width on xl */}
          <div className="xl:col-span-2 space-y-5">
            <BasicInfoSection
              commonForm={commonForm}
              setCommonForm={setCommonForm}
              categories={categories}
              brands={brands}
              selectionSettings={selectionSettings}
              setSelectionSettings={setSelectionSettings}
              handleCategorySelection={handleCategorySelection}
              handleFileSelection={handleFileSelection}
            />

            <DescriptionSection
              commonForm={commonForm}
              setCommonForm={setCommonForm}
              handleFileSelection={handleFileSelection}
            />

            <SpecificationsSection
              specifications={specifications}
              setSpecifications={setSpecifications}
            />

            <VariantSection
              variants={variants}
              setVariants={setVariants}
              selectionSettings={selectionSettings}
              commonForm={commonForm}
              updateVariant={updateVariant}
              handleFileSelection={handleFileSelection}
              updateAttributeValue={updateAttributeValue}
              addAttributeValue={addAttributeValue}
              removeAttributeValue={removeAttributeValue}
              addVariantRow={addVariantRow}
            />
          </div>

          {/* Sidebar — 1/3 width on xl */}
          <div className="xl:col-span-1">
            <SummarySidebar
              commonForm={commonForm}
              setCommonForm={setCommonForm}
              variants={variants}
              loading={loading}
              handleCreateProduct={handleCreateProduct}
            />
          </div>
        </div>
      </div>
    </div>
  );
}