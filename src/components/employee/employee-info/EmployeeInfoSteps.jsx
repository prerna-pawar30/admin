import React from "react";
import { Eye, Lock } from "lucide-react";
import { SelectInput, TextInput } from "../../ui/FormField";
import { ROLE_LABELS } from "../../../constants/UserRoles";
import { BLOOD_GROUPS, EMPLOYMENT_TYPES, GENDERS, MARITAL_STATUSES } from "../../../constants/EmployeeConstants";

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

/** Address block reused for current / permanent address. */
const AddressFields = ({ prefix, value = {}, onChange, errors }) => {
  const set = (key) => (event) => onChange({ ...value, [key]: event.target.value });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextInput id={`${prefix}-line1`} label="Address line 1" value={value.line1 || ""} onChange={set("line1")} className="sm:col-span-2" />
      <TextInput id={`${prefix}-line2`} label="Address line 2" value={value.line2 || ""} onChange={set("line2")} className="sm:col-span-2" />
      <TextInput id={`${prefix}-city`} label="City" value={value.city || ""} onChange={set("city")} />
      <TextInput id={`${prefix}-state`} label="State" value={value.state || ""} onChange={set("state")} />
      <TextInput id={`${prefix}-pincode`} label="Pincode" inputMode="numeric" maxLength={6} value={value.pincode || ""} error={errors[`${prefix}.pincode`]} onChange={set("pincode")} />
      <TextInput id={`${prefix}-country`} label="Country" value={value.country || ""} onChange={set("country")} />
    </div>
  );
};

const Section = ({ title, children }) => (
  <fieldset className="space-y-3">
    <legend className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">{title}</legend>
    {children}
  </fieldset>
);

/** Step 1: login account (create) or names / personal e-mail (edit). */
export const AccountStep = ({ data, onChange, errors, isEdit, role }) => {
  const set = (key) => (event) => onChange({ ...data, [key]: event.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextInput id="account-first" label="First name" required value={data.firstName} error={errors.firstName} onChange={set("firstName")} />
      <TextInput id="account-last" label="Last name" required value={data.lastName} error={errors.lastName} onChange={set("lastName")} />
      <TextInput
        id="account-email"
        type="email"
        label="Work e-mail"
        required={!isEdit}
        disabled={isEdit}
        placeholder="name@digident.in"
        value={data.email}
        error={errors.email}
        onChange={set("email")}
      />
      <TextInput id="account-personal" type="email" label="Personal e-mail" required value={data.personalEmail} error={errors.personalEmail} onChange={set("personalEmail")} />
      {!isEdit ? (
        <>
          <TextInput id="account-password" type="password" autoComplete="new-password" label="Initial password" required hint="At least 8 characters. Never saved in the draft." value={data.password} error={errors.password} onChange={set("password")} />
          <SelectInput id="account-role" label="Role" required options={ROLE_OPTIONS} value={String(data.role)} error={errors.role} onChange={set("role")} />
        </>
      ) : (
        <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 sm:col-span-2">
          <Lock size={13} /> Role: <b>{ROLE_LABELS[role] || "-"}</b>. Change the role and permissions from the Employee List / Permissions screen.
        </p>
      )}
    </div>
  );
};

/** Step 2: personal details, addresses and emergency contact. */
export const PersonalStep = ({ data, onChange, errors, contactOnly = false }) => {
  const set = (key) => (event) => onChange({ ...data, [key]: event.target.value });
  const phoneField = (
    <TextInput id="personal-phone" label="Phone" inputMode="numeric" maxLength={10} placeholder="10 digits" value={data.phone || ""} error={errors["personal.phone"]} onChange={set("phone")} />
  );
  return (
    <div className="space-y-6">
      {contactOnly ? (
        <div className="grid gap-4 sm:grid-cols-2">{phoneField}</div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TextInput id="personal-dob" type="date" label="Date of birth" value={data.dateOfBirth || ""} error={errors["personal.dateOfBirth"]} onChange={set("dateOfBirth")} />
        <SelectInput id="personal-gender" label="Gender" placeholder="Choose..." options={GENDERS} value={data.gender || ""} onChange={set("gender")} />
        <SelectInput id="personal-marital" label="Marital status" placeholder="Choose..." options={MARITAL_STATUSES} value={data.maritalStatus || ""} onChange={set("maritalStatus")} />
        <SelectInput id="personal-blood" label="Blood group" placeholder="Choose..." options={BLOOD_GROUPS} value={data.bloodGroup || ""} onChange={set("bloodGroup")} />
        {phoneField}
      </div>
      )}
      <Section title="Current address">
        <AddressFields prefix="personal.currentAddress" value={data.currentAddress} errors={errors} onChange={(value) => onChange({ ...data, currentAddress: value })} />
      </Section>
      <Section title="Permanent address">
        <button type="button" className="text-xs font-bold text-[#E68736] hover:underline" onClick={() => onChange({ ...data, permanentAddress: { ...data.currentAddress } })}>
          Same as current address
        </button>
        <AddressFields prefix="personal.permanentAddress" value={data.permanentAddress} errors={errors} onChange={(value) => onChange({ ...data, permanentAddress: value })} />
      </Section>
      <Section title="Emergency contact">
        <div className="grid gap-3 sm:grid-cols-3">
          <TextInput id="emergency-name" label="Name" value={data.emergencyContact?.name || ""} error={errors["personal.emergencyContact.name"]} onChange={(event) => onChange({ ...data, emergencyContact: { ...data.emergencyContact, name: event.target.value } })} />
          <TextInput id="emergency-relation" label="Relation" value={data.emergencyContact?.relation || ""} onChange={(event) => onChange({ ...data, emergencyContact: { ...data.emergencyContact, relation: event.target.value } })} />
          <TextInput id="emergency-phone" label="Phone" inputMode="numeric" maxLength={10} value={data.emergencyContact?.phone || ""} error={errors["personal.emergencyContact.phone"]} onChange={(event) => onChange({ ...data, emergencyContact: { ...data.emergencyContact, phone: event.target.value } })} />
        </div>
      </Section>
    </div>
  );
};

/** Step 3: employment details. */
export const EmploymentStep = ({ data, onChange, errors, managers }) => {
  const set = (key) => (event) => onChange({ ...data, [key]: event.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <TextInput id="employment-code" label="Employee code" placeholder="e.g. DG-014" value={data.employeeCode || ""} error={errors["employment.employeeCode"]} onChange={set("employeeCode")} hint="Unique" />
      <TextInput id="employment-designation" label="Designation" value={data.designation || ""} onChange={set("designation")} />
      <TextInput id="employment-department" label="Department" value={data.department || ""} onChange={set("department")} />
      <TextInput id="employment-joining" type="date" label="Joining date" value={data.joiningDate || ""} error={errors["employment.joiningDate"]} onChange={set("joiningDate")} hint="Days before it are not paid" />
      <SelectInput id="employment-type" label="Employment type" placeholder="Choose..." options={EMPLOYMENT_TYPES} value={data.employmentType || ""} onChange={set("employmentType")} />
      <SelectInput id="employment-manager" label="Reporting manager" placeholder="None" options={managers} value={data.reportingManager || ""} onChange={set("reportingManager")} />
      <TextInput id="employment-location" label="Work location" value={data.workLocation || ""} onChange={set("workLocation")} />
      <TextInput
        id="employment-shift"
        type="number"
        min="1"
        max="16"
        step="0.5"
        label="Default shift (hours)"
        placeholder="8"
        value={data.shiftHours ?? ""}
        error={errors["employment.shiftHours"]}
        onChange={set("shiftHours")}
        hint="Mon-Fri. Saturday is always 09:00-15:00."
      />
    </div>
  );
};

/**
 * Step 4: bank and statutory. Saved values are only shown masked (XXXX1234); typing a new value
 * replaces it. "Reveal" needs employee.sensitive.read and is audited.
 */
export const BankStep = ({ data, onChange, errors, masked, canReveal, onReveal, revealed }) => {
  const set = (key) => (event) => onChange({ ...data, [key]: event.target.value });
  const sensitive = (key, label, extra = {}) => (
    <TextInput
      id={`bank-${key}`}
      label={label}
      autoComplete="off"
      placeholder={masked?.[key] || ""}
      value={data[key] || ""}
      error={errors[`bank.${key}`]}
      hint={masked?.[key] ? (revealed ? `Saved: ${masked[key]}` : "Saved value hidden - type to replace") : undefined}
      onChange={set(key)}
      {...extra}
    />
  );
  return (
    <div className="space-y-4">
      <p className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <Lock size={13} /> Encrypted on the server and never kept in the draft.
        {canReveal && !revealed && (
          <button type="button" onClick={onReveal} className="inline-flex items-center gap-1 font-bold text-[#E68736] hover:underline">
            <Eye size={13} /> Reveal saved values (logged)
          </button>
        )}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput id="bank-name" label="Bank name" value={data.bankName || ""} onChange={set("bankName")} />
        <TextInput id="bank-ifsc" label="IFSC" maxLength={11} placeholder="HDFC0001234" value={data.ifsc || ""} error={errors["bank.ifsc"]} onChange={set("ifsc")} />
        {sensitive("accountNumber", "Account number", { inputMode: "numeric", maxLength: 18 })}
        {sensitive("pan", "PAN", { maxLength: 10 })}
        {sensitive("aadhaar", "Aadhaar", { inputMode: "numeric", maxLength: 14 })}
        {sensitive("uan", "UAN", { inputMode: "numeric", maxLength: 12 })}
      </div>
    </div>
  );
};
