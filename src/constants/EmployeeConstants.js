/**
 * Options for the employee information form and documents. The server validates the same values.
 */
export const GENDERS = Object.freeze([
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
]);

export const MARITAL_STATUSES = Object.freeze([
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
]);

export const BLOOD_GROUPS = Object.freeze(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((value) => ({ value, label: value })));

export const EMPLOYMENT_TYPES = Object.freeze([
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Intern" },
  { value: "PROBATION", label: "Probation" },
]);

export const DOCUMENT_TYPES = Object.freeze([
  { value: "AADHAAR", label: "Aadhaar" },
  { value: "PAN", label: "PAN" },
  { value: "PHOTO", label: "Photo" },
  { value: "RESUME", label: "Resume" },
  { value: "OFFER_LETTER", label: "Offer letter" },
  { value: "EDUCATION_CERTIFICATE", label: "Education certificate" },
  { value: "EXPERIENCE_LETTER", label: "Experience letter" },
  { value: "BANK_PROOF", label: "Bank proof" },
  { value: "OTHER", label: "Other" },
]);

export const DOCUMENT_STATUS_STYLE = Object.freeze({
  UPLOADED: "bg-sky-100 text-sky-700",
  VERIFIED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
});

export const ALLOWED_DOCUMENT_MIME = Object.freeze(["application/pdf", "image/jpeg", "image/png"]);
export const ALLOWED_DOCUMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";
export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

export const EMPLOYEE_FORM_STEPS = Object.freeze([
  { key: "account", label: "Account" },
  { key: "personal", label: "Personal" },
  { key: "employment", label: "Employment" },
  { key: "bank", label: "Bank & statutory" },
  { key: "documents", label: "Documents" },
]);

export const EMPTY_ADDRESS = Object.freeze({ line1: "", line2: "", city: "", state: "", pincode: "", country: "India" });

/** Draft key in localStorage. Passwords and bank / statutory numbers are never saved in a draft. */
export const EMPLOYEE_DRAFT_KEY = "employeeInfoFormDraft";
export const DRAFT_EXCLUDED_FIELDS = Object.freeze(["password", "accountNumber", "pan", "aadhaar", "uan"]);

export const labelFor = (options, value) => options.find((option) => option.value === value)?.label || value || "-";
