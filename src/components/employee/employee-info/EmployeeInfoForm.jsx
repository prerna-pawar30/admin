import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { Check, Save, UserCog } from "lucide-react";
import { EmployeeProfileService, EmployeeService } from "../../../backend/ApiService";
import { DRAFT_EXCLUDED_FIELDS, EMPLOYEE_DRAFT_KEY, EMPLOYEE_FORM_STEPS, EMPTY_ADDRESS } from "../../../constants/EmployeeConstants";
import { HR_PERMISSIONS } from "../../../constants/PayrollConstants";
import { USER_ROLES } from "../../../constants/UserRoles";
import { validateAccountStep, validateBankStep, validateEmploymentStep, validatePersonalStep } from "../../../validators/EmployeeValidator";
import { Button } from "../../ui/FormField";
import { ErrorBlock, LoadingBlock } from "../../ui/StateBlock";
import { AccountStep, BankStep, EmploymentStep, PersonalStep } from "./EmployeeInfoSteps";
import DocumentUploader from "./DocumentUploader";

const EMPTY_FORM = {
  employeeId: null,
  account: { firstName: "", lastName: "", email: "", personalEmail: "", password: "", role: String(USER_ROLES.EXECUTIVE) },
  personal: { dateOfBirth: "", gender: "", maritalStatus: "", bloodGroup: "", phone: "", currentAddress: { ...EMPTY_ADDRESS }, permanentAddress: { ...EMPTY_ADDRESS }, emergencyContact: { name: "", relation: "", phone: "" } },
  employment: { employeeCode: "", designation: "", department: "", joiningDate: "", employmentType: "", reportingManager: "", workLocation: "", shiftHours: "" },
  bank: { bankName: "", ifsc: "", accountNumber: "", pan: "", aadhaar: "", uan: "" },
};

const errorText = (error, fallback) => error?.response?.data?.message || fallback;
const serverFieldErrors = (error) =>
  Object.fromEntries((error?.response?.data?.error?.details || []).map((detail) => [detail.field, detail.message]));

/** Removes passwords and bank / statutory numbers before a draft is written to localStorage. */
const toDraft = (form) => ({
  ...form,
  account: Object.fromEntries(Object.entries(form.account).filter(([key]) => !DRAFT_EXCLUDED_FIELDS.includes(key))),
  bank: Object.fromEntries(Object.entries(form.bank).filter(([key]) => !DRAFT_EXCLUDED_FIELDS.includes(key))),
});

const readDraft = () => {
  try {
    return JSON.parse(localStorage.getItem(EMPLOYEE_DRAFT_KEY) || "null");
  } catch {
    return null; // a broken draft is simply ignored
  }
};

/** Server profile -> form values (sensitive values stay empty; masked ones are shown as hints). */
const fromProfile = (profile) => ({
  employeeId: profile.employee._id,
  account: { firstName: profile.employee.firstName, lastName: profile.employee.lastName, email: profile.employee.email, personalEmail: profile.employee.personalEmail || "", password: "", role: String(profile.employee.role) },
  personal: {
    ...EMPTY_FORM.personal,
    ...profile.personal,
    dateOfBirth: profile.personal.dateOfBirth || "",
    gender: profile.personal.gender || "",
    maritalStatus: profile.personal.maritalStatus || "",
    bloodGroup: profile.personal.bloodGroup || "",
    phone: profile.personal.phone || "",
    currentAddress: { ...EMPTY_ADDRESS, ...profile.personal.currentAddress },
    permanentAddress: { ...EMPTY_ADDRESS, ...profile.personal.permanentAddress },
    emergencyContact: { name: "", relation: "", phone: "", ...profile.personal.emergencyContact },
  },
  employment: {
    ...EMPTY_FORM.employment,
    ...profile.employment,
    employeeCode: profile.employment.employeeCode || "",
    joiningDate: profile.employment.joiningDate || "",
    employmentType: profile.employment.employmentType || "",
    reportingManager: profile.employment.reportingManager?._id || "",
    shiftHours: profile.employment.shiftHours ?? "",
  },
  bank: { bankName: profile.bank.bankName || "", ifsc: profile.bank.ifsc || "", accountNumber: "", pan: "", aadhaar: "", uan: "" },
});

/**
 * Multi-step employee information form (admin create / edit) with per-step validation, a saved
 * draft and per-step save:
 *   create: Account (creates the login) -> Personal -> Employment -> Bank -> Documents
 *   edit (/workforce/employees/:employeeId/edit): the same steps, loaded from the server.
 */
export default function EmployeeInfoForm() {
  const { employeeId: routeEmployeeId } = useParams();
  const isEdit = Boolean(routeEmployeeId);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = [0, 1].includes(Number(user?.role));
  const can = (permission) => isAdmin || user?.permissions?.includes(permission);

  const [form, setForm] = useState(EMPTY_FORM);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [load, setLoad] = useState({ loading: isEdit, error: null });
  const [masked, setMasked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [managers, setManagers] = useState([]);
  const [completed, setCompleted] = useState(new Set());

  const employeeId = routeEmployeeId || form.employeeId;
  const step = EMPLOYEE_FORM_STEPS[stepIndex];

  /* ---------- load: edit mode from the server, create mode from a draft ---------- */
  const loadProfile = useCallback(async () => {
    setLoad({ loading: true, error: null });
    try {
      const response = await EmployeeProfileService.get(routeEmployeeId);
      setForm(fromProfile(response.data));
      setMasked(response.data.bank);
      setCompleted(new Set(Object.entries(response.data.completion).filter(([, done]) => done).map(([key]) => key)));
      setLoad({ loading: false, error: null });
    } catch (error) {
      setLoad({ loading: false, error: errorText(error, "Could not load this employee") });
    }
  }, [routeEmployeeId]);

  useEffect(() => {
    if (isEdit) {
      loadProfile();
      return;
    }
    const draft = readDraft();
    if (draft?.account) {
      Swal.fire({ title: "Continue your draft?", text: `${draft.account.firstName || "Unnamed"} ${draft.account.lastName || ""}`, showCancelButton: true, confirmButtonText: "Continue", cancelButtonText: "Start over", confirmButtonColor: "#E68736" }).then(
        (choice) => {
          if (choice.isConfirmed) {
            setForm({ ...EMPTY_FORM, ...draft, account: { ...EMPTY_FORM.account, ...draft.account }, bank: { ...EMPTY_FORM.bank, ...draft.bank } });
            setStepIndex(draft.stepIndex || 0);
          } else {
            localStorage.removeItem(EMPLOYEE_DRAFT_KEY);
          }
        }
      );
    }
  }, [isEdit, loadProfile]);

  useEffect(() => {
    EmployeeService.getAllEmployees()
      .then((response) => setManagers((response.data || []).map((employee) => ({ value: employee._id, label: `${employee.firstName} ${employee.lastName}` }))))
      .catch(() => setManagers([]));
  }, []);

  const managerOptions = useMemo(() => managers.filter((manager) => manager.value !== employeeId), [managers, employeeId]);

  const saveDraft = (nextForm = form, nextStep = stepIndex) => {
    if (isEdit) return;
    try {
      localStorage.setItem(EMPLOYEE_DRAFT_KEY, JSON.stringify({ ...toDraft(nextForm), stepIndex: nextStep }));
    } catch {
      // storage full or disabled: the draft is optional
    }
  };

  const update = (section) => (value) => setForm((previous) => ({ ...previous, [section]: value }));

  /* ---------- save the current step ---------- */
  const saveStep = async () => {
    setErrors({});
    let payload;
    try {
      if (step.key === "account") payload = validateAccountStep(form.account, { isEdit: Boolean(employeeId) });
      if (step.key === "personal") payload = validatePersonalStep(form.personal);
      if (step.key === "employment") payload = validateEmploymentStep(form.employment);
      if (step.key === "bank") payload = validateBankStep(form.bank);
    } catch (validation) {
      setErrors(validation.validationErrors || {});
      return false;
    }
    if (step.key === "documents") return true;

    setSaving(true);
    try {
      if (step.key === "account" && !employeeId) {
        const created = await EmployeeService.createEmployee(payload);
        const newId = created.data?._id;
        const nextForm = { ...form, employeeId: newId, account: { ...form.account, password: "" } };
        setForm(nextForm);
        saveDraft(nextForm, stepIndex + 1);
      } else {
        const body = step.key === "account" ? { account: payload } : { [step.key]: payload };
        const response = await EmployeeProfileService.update(employeeId, body);
        if (step.key === "bank") {
          setMasked(response.data.bank);
          setForm((previous) => ({ ...previous, bank: { ...previous.bank, accountNumber: "", pan: "", aadhaar: "", uan: "" } }));
        }
        saveDraft();
      }
      setCompleted((previous) => new Set([...previous, step.key]));
      return true;
    } catch (error) {
      setErrors(serverFieldErrors(error));
      Swal.fire("Could not save", errorText(error, "Please check this step"), "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    if (!(await saveStep())) return;
    if (stepIndex < EMPLOYEE_FORM_STEPS.length - 1) setStepIndex(stepIndex + 1);
  };

  const finish = () => {
    localStorage.removeItem(EMPLOYEE_DRAFT_KEY);
    Swal.fire("Saved", "Employee information is up to date.", "success");
    navigate("/workforce/employees");
  };

  const reveal = async () => {
    try {
      const response = await EmployeeProfileService.get(employeeId, { reveal: true });
      setMasked(response.data.bank);
      setRevealed(true);
    } catch (error) {
      Swal.fire("Not allowed", errorText(error, "You cannot view these values"), "error");
    }
  };

  if (load.loading) return <LoadingBlock text="Loading employee" />;
  if (load.error) return <ErrorBlock message={load.error} onRetry={loadProfile} />;

  const canUseLaterSteps = Boolean(employeeId);
  const isLast = stepIndex === EMPLOYEE_FORM_STEPS.length - 1;

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          <UserCog className="text-[#E68736]" /> {isEdit ? `Edit ${form.account.firstName} ${form.account.lastName}` : "Add New Employee"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Each step is checked and saved on its own. {!isEdit && "A draft is kept on this device (without passwords or bank numbers)."}</p>
      </div>

      <ol className="mb-6 grid grid-cols-5 gap-1 sm:gap-2" aria-label="Steps">
        {EMPLOYEE_FORM_STEPS.map((item, index) => {
          const isDone = completed.has(item.key);
          const isCurrent = index === stepIndex;
          const reachable = index === 0 || canUseLaterSteps;
          return (
            <li key={item.key}>
              <button
                type="button"
                disabled={!reachable}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => reachable && setStepIndex(index)}
                className={`flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-center transition-colors disabled:opacity-40 ${isCurrent ? "bg-[#E68736] text-white" : isDone ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs font-bold">{isDone && !isCurrent ? <Check size={13} /> : index + 1}</span>
                <span className="hidden text-[11px] font-bold uppercase tracking-wider sm:block">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="mb-5 text-lg font-bold text-slate-800">{step.label}</h2>
        {step.key === "account" && <AccountStep data={form.account} onChange={update("account")} errors={errors} isEdit={Boolean(employeeId)} role={form.account.role} />}
        {step.key === "personal" && <PersonalStep data={form.personal} onChange={update("personal")} errors={errors} />}
        {step.key === "employment" && <EmploymentStep data={form.employment} onChange={update("employment")} errors={errors} managers={managerOptions} />}
        {step.key === "bank" && <BankStep data={form.bank} onChange={update("bank")} errors={errors} masked={masked} canReveal={can(HR_PERMISSIONS.SENSITIVE_READ)} onReveal={reveal} revealed={revealed} />}
        {step.key === "documents" && <DocumentUploader employeeId={employeeId} canVerify={can(HR_PERMISSIONS.DOCUMENT_VERIFY)} />}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <Button variant="secondary" disabled={stepIndex === 0 || saving} onClick={() => setStepIndex(stepIndex - 1)}>
            Back
          </Button>
          <div className="flex flex-wrap gap-2">
            {!isEdit && (
              <Button
                variant="ghost"
                onClick={() => {
                  saveDraft();
                  Swal.fire({ toast: true, position: "top-end", timer: 1800, showConfirmButton: false, icon: "success", title: "Draft saved" });
                }}
              >
                <Save size={14} /> Save draft
              </Button>
            )}
            {isLast ? (
              <Button onClick={finish}>Finish</Button>
            ) : (
              <Button onClick={goNext} disabled={saving}>
                {saving ? "Saving..." : step.key === "account" && !employeeId ? "Create account & continue" : "Save & continue"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
