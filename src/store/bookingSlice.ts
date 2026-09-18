import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { BookingAPI, TenantBooking } from '../api/bookings'

export interface BookingDetails {
  roomId: string,
  roomName: string,
  seatIndex: number,
  pricePerSeat: string,
  date: string,
  duration: number
}

export interface BookingState {
  data?: BookingDetails,
  myBookings: TenantBooking[],
  loading: boolean,
  refreshing: boolean,
  error: string | null,
}

const initialState: BookingState = {
  data: undefined,
  myBookings: [],
  loading: false,
  refreshing: false,
  error: null,
}

export const fetchMyBookings = createAsyncThunk(
  'booking/fetchMyBookings',
  async (isRefresh: boolean | undefined, { dispatch }) => {
    try {
      if (isRefresh) {
        dispatch(setRefreshing(true));
      } else {
        dispatch(setLoading(true));
      }
      dispatch(setError(null));

      const data = await BookingAPI.getMyBookings();
      // Sort most recent first by createdAt
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      dispatch(setMyBookings(sorted));
      return sorted;
    } catch (err: any) {
      console.error('Failed to fetch my bookings', err);
      dispatch(setError(err?.response?.data?.message || 'Failed to load reservations.'));
      throw err;
    } finally {
      dispatch(setLoading(false));
      dispatch(setRefreshing(false));
    }
  }
);

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    updateBookingDetails: (state, action: PayloadAction<BookingDetails>) => {
      state.data = action.payload;
    },
    setMyBookings: (state, action: PayloadAction<TenantBooking[]>) => {
      state.myBookings = action.payload;
    },
    addConfirmedBooking: (state, action: PayloadAction<TenantBooking>) => {
      // Remove any existing entry with same id if any, then prepend
      state.myBookings = [
        action.payload,
        ...state.myBookings.filter((b) => b.id !== action.payload.id),
      ];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  updateBookingDetails,
  setMyBookings,
  addConfirmedBooking,
  setLoading,
  setRefreshing,
  setError,
} = bookingSlice.actions

export default bookingSlice.reducer