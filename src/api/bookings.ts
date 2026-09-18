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

export interface TenantBooking {
  id: string;
  tenantId: string;
  roomId: string;
  seatNumber: number;
  leaseStart: string;
  leaseEnd: string;
  durationMonths: number;
  totalAmount: string | number;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
  room?: {
    id: string;
    name: string;
    roomTypeId: string;
    seatCapacity?: number;
    hasAC?: boolean;
    pricePerMonth?: string | number;
    roomType?: {
      id: string;
      name: string;
      propertyId: string;
      property?: {
        id: string;
        title: string;
        address: string;
        city: string;
        imageUrl?: string;
        type?: string;
        rating?: string | number;
      };
    };
  };
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
   * One-shot create and confirm in a single atomic transaction.
   * PUT /api/bookings
   */
  createOneShotConfirmed: async (payload: {
    roomId: string;
    seatNumber?: number;
    seatIndex?: number;
    startMonth?: string;
    date?: string;
    durationMonths?: number;
    period?: number;
  }): Promise<BookingResult> => {
    const { data } = await apiClient.put<BookingResult>('bookings', payload);
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
  getMyBookings: async (): Promise<TenantBooking[]> => {
    const { data } = await apiClient.get<TenantBooking[] | { data: TenantBooking[] }>('bookings/my');
    return Array.isArray(data) ? data : (data as any)?.data || [];
  },
}