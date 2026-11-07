import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Award, Briefcase, Calendar, Landmark, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { EmployeeProfileService } from "../../backend/ApiService";
import { ROLE_LABELS } from "../../constants/UserRoles";
import { EMPLOYMENT_TYPES, EMPTY_ADDRESS, labelFor } from "../../constants/EmployeeConstants";
import { validateMyContact } from "../../validators/EmployeeValidator";
import { formatDateKey } from "../../utils/IstTime";
import { PersonalStep } from "./employee-info/EmployeeInfoSteps";
import DocumentUploader from "./employee-info/DocumentUploader";
import { Button } from "../ui/FormField";
import { ErrorBlock, LoadingBlock } from "../ui/StateBlock";

const errorText = (error, fallback) => error?.response?.data?.message || fallback;

const toContactForm = (personal = {}) => ({
  dateOfBirth: personal.dateOfBirth || "",
  gender: personal.gender || "",
  maritalStatus: personal.maritalStatus || "",
  bloodGroup: personal.bloodGroup || "",
  phone: personal.phone || "",
  currentAddress: { ...EMPTY_ADDRESS, ...personal.currentAddress },
  permanentAddress: { ...EMPTY_ADDRESS, ...personal.permanentAddress },
  emergencyContact: { name: "", relation: "", phone: "", ...personal.emergencyContact },
});

/**
 * My profile: account and employment details (read-only), bank details (masked), and the parts
 * an employee may change themselves - phone, addresses, emergency contact - plus own documents.
 */
const Profile = () => {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [contact, setContact] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("details");

  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const response = await EmployeeProfileService.getMine();
      setState({ data: response.data, loading: false, error: null });
      setContact(toContactForm(response.data.personal));
    } catch (error) {
      setState({ data: null, loading: false, error: errorText(error, "Could not load your profile") });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveContact = async (event) => {
    event.preventDefault();
    let payload;
    try {
      payload = validateMyContact(contact);
      setErrors({});
    } catch (validation) {
      setErrors(validation.validationErrors || {});
      return;
    }
    setSaving(true);
    try {
      const response = await EmployeeProfileService.updateMine(payload);
      setState({ data: response.data, loading: false, error: null });
      Swal.fire({ toast: true, position: "top-end", timer: 2000, showConfirmButton: false, icon: "success", title: "Contact details saved" });
    } catch (error) {
      Swal.fire("Could not save", errorText(error, "Please check the form"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (state.loading) return <LoadingBlock text="Loading profile" />;
  if (state.error) return <ErrorBlock message={state.error} onRetry={load} />;

  const { employee, employment, bank } = state.data;
  const isAdmin = [0, 1].includes(Number(employee.role));

  return (
    <div>
      <div className="max-w-5xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 md:p-10">
          <div className="absolute right-[-5%] top-[-10%] h-64 w-64 rounded-full bg-[#E68736] opacity-20 blur-[80px]" />
          <div className="relative flex flex-col items-center gap-6 md:flex-row">
            <div className={`flex h-24 w-24 items-center justify-center rounded-full text-white md:h-28 md:w-28 ${isAdmin ? "bg-slate-800" : "bg-[#E68736]"}`}>
              {isAdmin ? <ShieldCheck size={48} strokeWidth={1.5} /> : <User size={48} strokeWidth={1.5} />}
            </div>
            <div className="text-center md:text-left">
              <h1 className="mb-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                {employee.firstName} <span className="text-[#E68736]">{employee.lastName}</span>
              </h1>
              <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                <span className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-900">
                  <Award size={14} className="text-[#E68736]" /> {ROLE_LABELS[employee.role] || "Employee"}
                </span>
                {employment.employeeCode && (
                  <span className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">{employment.employeeCode}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2" role="tablist">
          {[
            ["details", "My details"],
            ["documents", "My documents"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider ${tab === key ? "bg-[#E68736] text-white" : "bg-white text-slate-500"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "documents" ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-8">
            <DocumentUploader employeeId={null} />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <Card title="Work" icon={Briefcase}>
                <Info icon={Mail} label="Work e-mail" value={employee.email} />
                <Info icon={Mail} label="Personal e-mail" value={employee.personalEmail} />
                <Info icon={Briefcase} label="Designation" value={[employment.designation, employment.department].filter(Boolean).join(" · ")} />
                <Info icon={Calendar} label="Joined" value={employment.joiningDate ? formatDateKey(employment.joiningDate) : null} />
                <Info icon={User} label="Type" value={employment.employmentType ? labelFor(EMPLOYMENT_TYPES, employment.employmentType) : null} />
                <Info icon={User} label="Reports to" value={employment.reportingManager?.name} />
              </Card>
              <Card title="Bank (masked)" icon={Landmark}>
                <Info icon={Landmark} label="Bank" value={[bank.bankName, bank.ifsc].filter(Boolean).join(" · ")} />
                <Info icon={Landmark} label="Account" value={bank.accountNumber} />
                <Info icon={ShieldCheck} label="PAN" value={bank.pan} />
                <Info icon={ShieldCheck} label="Aadhaar" value={bank.aadhaar} />
                <p className="text-[11px] text-slate-400">Ask HR to change bank or employment details.</p>
              </Card>
            </div>
            <form onSubmit={saveContact} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-8 lg:col-span-2" noValidate>
              <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#E68736]">
                <Phone size={15} /> Contact, address & emergency contact
              </h2>
              <p className="mb-5 text-xs text-slate-400">You can update these yourself. Date of birth and other personal details are maintained by HR.</p>
              <PersonalStep data={contact} onChange={setContact} errors={errors} contactOnly />
              <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save my details"}</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const Card = ({ title, icon, children }) => {
  const Icon = icon;
  return (
  <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
      <Icon size={14} /> {title}
    </h2>
    {children}
  </div>
  );
};

const Info = ({ icon, label, value }) => {
  const Icon = icon;
  return (
  <div className="flex items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-[#E68736]">
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="truncate text-[13px] font-bold text-slate-800">{value || "Not set"}</p>
    </div>
  </div>
  );
};

export default Profile;
