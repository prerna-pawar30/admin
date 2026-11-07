/**
 * Shared attendance state: today's punch status (punch card, portal, dashboard hero) and the
 * employee's month calendar. Data comes from the server; nothing is calculated here.
 */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AttendanceService } from "../../backend/ApiService";
import { currentIstMonth } from "../../utils/IstTime";

const errorMessage = (error, fallback) => error?.response?.data?.message || fallback;

export const fetchTodayStatus = createAsyncThunk("attendance/fetchToday", async (_, { rejectWithValue }) => {
  try {
    const response = await AttendanceService.getToday();
    return { ...response.data, receivedAt: Date.now() };
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Could not load today's attendance"));
  }
});

export const fetchMyCalendar = createAsyncThunk("attendance/fetchCalendar", async ({ month, year }, { rejectWithValue }) => {
  try {
    const response = await AttendanceService.getMyCalendar({ month, year });
    return response.data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Could not load the calendar"));
  }
});

const initialState = {
  today: null,
  todayStatus: "idle",
  todayError: null,
  calendarMonth: currentIstMonth(),
  calendar: null,
  calendarStatus: "idle",
  calendarError: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    setCalendarMonth: (state, action) => {
      state.calendarMonth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayStatus.pending, (state) => {
        state.todayStatus = "loading";
        state.todayError = null;
      })
      .addCase(fetchTodayStatus.fulfilled, (state, action) => {
        state.todayStatus = "succeeded";
        state.today = action.payload;
      })
      .addCase(fetchTodayStatus.rejected, (state, action) => {
        state.todayStatus = "failed";
        state.todayError = action.payload;
      })
      .addCase(fetchMyCalendar.pending, (state) => {
        state.calendarStatus = "loading";
        state.calendarError = null;
      })
      .addCase(fetchMyCalendar.fulfilled, (state, action) => {
        state.calendarStatus = "succeeded";
        state.calendar = action.payload;
      })
      .addCase(fetchMyCalendar.rejected, (state, action) => {
        state.calendarStatus = "failed";
        state.calendarError = action.payload;
      });
  },
});

export const { setCalendarMonth } = attendanceSlice.actions;
export default attendanceSlice.reducer;
