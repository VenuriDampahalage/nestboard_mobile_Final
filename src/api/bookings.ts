import { apiClient } from "./apiClient"

export interface BookingResult {
  id: string;
  roomId: string;
  seatNumber: number;
  leaseStart: string;
  leaseEnd: string;
  durationMonths: number;
  totalAmount: string;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
}

export const BookingAPI = {
  /**
   * Step 1 — Create a PENDING booking (holds the seat for 10 minutes).
   * POST /api/bookings
   */
  createPending: async (
    roomId: string,
    seatNumber: number,
    startMonth: string,       // "YYYY-MM" e.g. "2026-07"
    durationMonths: number,
  ): Promise<BookingResult> => {
    const { data } = await apiClient.post<BookingResult>('bookings', {
      roomId,
      seatNumber,
      startMonth,
      durationMonths,
    });
    return data;
  },

  /**
   * Step 2 — Confirm an existing PENDING booking within the 10-minute window.
   * POST /api/bookings/:id/confirm
   */
  confirmBooking: async (bookingId: string): Promise<BookingResult> => {
    const { data } = await apiClient.post<BookingResult>(`bookings/${bookingId}/confirm`);
    return data;
  },

  /**
   * Get all bookings for the logged-in tenant.
   * GET /api/bookings/my
   */
  getMyBookings: async (): Promise<BookingResult[]> => {
    const { data } = await apiClient.get<BookingResult[]>('bookings/my');
    return data;
  },
}