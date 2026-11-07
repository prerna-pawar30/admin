/**
 * Employee information form checks, one function per step, run before every API call. Same
 * formats as the server (backend controllers/employeeprofile/employeeprofile.validator.js).
 * Each throws { validationErrors: { "section.field": message } } and returns the cleaned payload.
 */
import { ALLOWED_DOCUMENT_MIME, MAX_DOCUMENT_BYTES } from "../constants/EmployeeConstants";

export const PATTERNS = Object.freeze({
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  workEmail: /@digident\.in$/i,
  phone: /^\d{10}$/,
  pan: /^[A-Z]{5}\d{4}[A-Z]$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  aadhaar: /^\d{12}$/,
  uan: /^\d{12}$/,
  accountNumber: /^\d{9,18}$/,
  pincode: /^\d{6}$/,
  employeeCode: /^[A-Z0-9-]{2,20}$/,
  dateKey: /^\d{4}-\d{2}-\d{2}$/,
});

const fail = (errors) => {
  if (Object.keys(errors).length) throw { validationErrors: errors };
};
const blankToNull = (value) => (value === "" || value === undefined ? null : value);
const trimAll = (object) => Object.fromEntries(Object.entries(object || {}).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]));

/** Step 1 (create only): the login account. */
export const validateAccountStep = (data, { isEdit = false } = {}) => {
  const errors = {};
  if ((data.firstName || "").trim().length < 2) errors.firstName = "First name is required";
  if ((data.lastName || "").trim().length < 2) errors.lastName = "Last name is required";
  if (!isEdit) {
    if (!PATTERNS.email.test(data.email || "") || !PATTERNS.workEmail.test(data.email || "")) errors.email = "Work e-mail must end with @digident.in";
    if ((data.password || "").length < 8) errors.password = "Password must be at least 8 characters";
    if (data.role === undefined || data.role === "") errors.role = "Choose a role";
  }
  if (!PATTERNS.email.test(data.personalEmail || "")) errors.personalEmail = "Enter a valid personal e-mail";
  fail(errors);
  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    personalEmail: data.personalEmail.trim().toLowerCase(),
    ...(isEdit ? {} : { email: data.email.trim().toLowerCase(), password: data.password, role: String(data.role), permission: "auth.account.create" }),
  };
};

const checkAddress = (prefix, address, errors) => {
  if (address?.pincode && !PATTERNS.pincode.test(address.pincode)) errors[`${prefix}.pincode`] = "Pincode must be 6 digits";
};

/** Step 2: personal details. */
export const validatePersonalStep = (personal) => {
  const errors = {};
  const data = trimAll(personal);
  if (data.phone && !PATTERNS.phone.test(data.phone)) errors["personal.phone"] = "Phone must be 10 digits";
  if (data.dateOfBirth && !PATTERNS.dateKey.test(data.dateOfBirth)) errors["personal.dateOfBirth"] = "Choose a valid date";
  if (data.dateOfBirth && data.dateOfBirth > new Date().toISOString().slice(0, 10)) errors["personal.dateOfBirth"] = "Date of birth cannot be in the future";
  checkAddress("personal.currentAddress", data.currentAddress, errors);
  checkAddress("personal.permanentAddress", data.permanentAddress, errors);
  const emergency = trimAll(data.emergencyContact);
  if (emergency.phone && !PATTERNS.phone.test(emergency.phone)) errors["personal.emergencyContact.phone"] = "Phone must be 10 digits";
  if ((emergency.name || emergency.phone) && !(emergency.name && emergency.phone)) {
    errors["personal.emergencyContact.name"] = "Give both a name and a phone for the emergency contact";
  }
  fail(errors);
  return {
    dateOfBirth: blankToNull(data.dateOfBirth),
    gender: blankToNull(data.gender),
    maritalStatus: blankToNull(data.maritalStatus),
    bloodGroup: blankToNull(data.bloodGroup),
    phone: data.phone || "",
    currentAddress: trimAll(data.currentAddress),
    permanentAddress: trimAll(data.permanentAddress),
    emergencyContact: emergency,
  };
};

/** Employee's own edit on the Profile page: contact, addresses, emergency contact only. */
export const validateMyContact = (data) => {
  const personal = validatePersonalStep(data);
  return {
    phone: personal.phone,
    currentAddress: personal.currentAddress,
    permanentAddress: personal.permanentAddress,
    emergencyContact: personal.emergencyContact,
  };
};

/** Step 3: employment details. */
export const validateEmploymentStep = (employment) => {
  const errors = {};
  const data = trimAll(employment);
  const code = (data.employeeCode || "").toUpperCase();
  if (code && !PATTERNS.employeeCode.test(code)) errors["employment.employeeCode"] = "Use 2-20 letters, digits or -";
  if (data.joiningDate && !PATTERNS.dateKey.test(data.joiningDate)) errors["employment.joiningDate"] = "Choose a valid date";
  if (data.shiftHours !== "" && data.shiftHours !== null && data.shiftHours !== undefined) {
    const hours = Number(data.shiftHours);
    if (!(hours >= 1 && hours <= 16)) errors["employment.shiftHours"] = "Shift must be 1-16 hours";
  }
  fail(errors);
  return {
    employeeCode: code || null,
    designation: data.designation || "",
    department: data.department || "",
    joiningDate: blankToNull(data.joiningDate),
    employmentType: blankToNull(data.employmentType),
    reportingManager: blankToNull(data.reportingManager),
    workLocation: data.workLocation || "",
    shiftHours: data.shiftHours === "" || data.shiftHours === null || data.shiftHours === undefined ? null : Number(data.shiftHours),
  };
};

/**
 * Step 4: bank and statutory. Masked values shown from the server ("XXXX1234") are not sent back;
 * a sensitive field is sent only when the user typed a new value.
 */
export const validateBankStep = (bank) => {
  const errors = {};
  const data = trimAll(bank);
  const changed = (value) => value !== undefined && value !== null && !String(value).includes("X");
  const ifsc = (data.ifsc || "").toUpperCase();
  const pan = (data.pan || "").toUpperCase();
  const aadhaar = (data.aadhaar || "").replace(/\s/g, "");
  if (ifsc && !PATTERNS.ifsc.test(ifsc)) errors["bank.ifsc"] = "IFSC looks like HDFC0001234";
  if (changed(data.accountNumber) && data.accountNumber && !PATTERNS.accountNumber.test(data.accountNumber)) errors["bank.accountNumber"] = "Account number must be 9-18 digits";
  if (changed(data.pan) && pan && !PATTERNS.pan.test(pan)) errors["bank.pan"] = "PAN looks like ABCDE1234F";
  if (changed(data.aadhaar) && aadhaar && !PATTERNS.aadhaar.test(aadhaar)) errors["bank.aadhaar"] = "Aadhaar must be 12 digits";
  if (changed(data.uan) && data.uan && !PATTERNS.uan.test(data.uan)) errors["bank.uan"] = "UAN must be 12 digits";
  fail(errors);
  return {
    bankName: data.bankName || "",
    ifsc,
    ...(changed(data.accountNumber) ? { accountNumber: data.accountNumber } : {}),
    ...(changed(data.pan) ? { pan } : {}),
    ...(changed(data.aadhaar) ? { aadhaar } : {}),
    ...(changed(data.uan) ? { uan: data.uan } : {}),
  };
};

/** A file picked for upload: PDF / JPG / PNG up to 5 MB (the server checks the real type). */
export const validateDocumentUpload = ({ file, documentType, expiryDate }) => {
  const errors = {};
  if (!documentType) errors.documentType = "Choose the document type";
  if (!file) errors.file = "Choose a file";
  else if (!ALLOWED_DOCUMENT_MIME.includes(file.type)) errors.file = "Only PDF, JPG or PNG files";
  else if (file.size > MAX_DOCUMENT_BYTES) errors.file = "File must be 5 MB or smaller";
  if (expiryDate && !PATTERNS.dateKey.test(expiryDate)) errors.expiryDate = "Choose a valid date";
  fail(errors);
  return { file, documentType, expiryDate: expiryDate || "" };
};

/** Salary revision (payroll screen). */
export const validateSalaryRevision = ({ baseSalary, effectiveFrom, note }) => {
  const errors = {};
  const amount = Number(baseSalary);
  if (!(amount >= 0) || baseSalary === "" || baseSalary === null) errors.baseSalary = "Enter the monthly base salary";
  else if (Math.round(amount * 100) !== amount * 100) errors.baseSalary = "At most 2 decimals";
  if (!PATTERNS.dateKey.test(effectiveFrom || "")) errors.effectiveFrom = "Choose the effective date";
  fail(errors);
  return { baseSalary: amount, effectiveFrom, note: (note || "").trim() };
};
