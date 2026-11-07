/**
 * Payroll page state: selected month, search, page, the server-computed rows and totals, and the
 * employee whose day-by-day breakdown is open. No salary math happens on the client.
 */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PayrollService } from "../../backend/ApiService";
import { currentIstMonth } from "../../utils/IstTime";
import { PAYROLL_PAGE_SIZE } from "../../constants/PayrollConstants";

const errorMessage = (error, fallback) => error?.response?.data?.message || fallback;

export const fetchPayroll = createAsyncThunk("payroll/fetchList", async (_, { getState, rejectWithValue }) => {
  const { filters } = getState().payroll;
  try {
    const response = await PayrollService.list({
      month: filters.month,
      year: filters.year,
      search: filters.search || undefined,
      paymentStatus: filters.paymentStatus || undefined,
      page: filters.page,
      limit: PAYROLL_PAGE_SIZE,
    });
    return { items: response.data, meta: response.meta, month: response.month, summary: response.summary };
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Could not load payroll"));
  }
});

export const fetchPayrollDetail = createAsyncThunk("payroll/fetchDetail", async (employeeId, { getState, rejectWithValue }) => {
  const { filters } = getState().payroll;
  try {
    const response = await PayrollService.employeeDetail(employeeId, { month: filters.month, year: filters.year });
    return response.data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Could not load the breakdown"));
  }
});

const initialState = {
  filters: { ...currentIstMonth(), search: "", paymentStatus: "", page: 1 },
  items: [],
  meta: null,
  month: null,
  summary: null,
  status: "idle",
  error: null,
  selectedEmployeeId: null,
  detail: null,
  detailStatus: "idle",
  detailError: null,
};

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    setPayrollMonth: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPayrollSearch: (state, action) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setPayrollPaymentFilter: (state, action) => {
      state.filters.paymentStatus = action.payload;
      state.filters.page = 1;
    },
    setPayrollPage: (state, action) => {
      state.filters.page = action.payload;
    },
    openPayrollDetail: (state, action) => {
      state.selectedEmployeeId = action.payload;
      state.detail = null;
    },
    closePayrollDetail: (state) => {
      state.selectedEmployeeId = null;
      state.detail = null;
      state.detailStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayroll.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPayroll.fulfilled, (state, action) => {
        state.status = "succeeded";
        Object.assign(state, action.payload);
      })
      .addCase(fetchPayroll.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchPayrollDetail.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchPayrollDetail.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.detail = action.payload;
      })
      .addCase(fetchPayrollDetail.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError = action.payload;
      });
  },
});

export const { setPayrollMonth, setPayrollSearch, setPayrollPaymentFilter, setPayrollPage, openPayrollDetail, closePayrollDetail } = payrollSlice.actions;
export default payrollSlice.reducer;
