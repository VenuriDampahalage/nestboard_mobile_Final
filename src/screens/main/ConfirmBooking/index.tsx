import { View, Text, Alert, ScrollView } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ConfirmScreenHeader from './components/Header'
import Typography from '../../../components/ui/Typography'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import RegularButton from '../../../components/ui/RegularButton'
import { CheckCircle, Clock, Lock, AlertCircle } from 'lucide-react-native'
import { BookingAPI, BookingResult } from '../../../api/bookings'
import { Colors } from '../../../constant/colors'
import { Picker } from '@react-native-picker/picker';
import { formatNumberIntoCurrency } from '../../../util/common'
import { useNavigation } from '@react-navigation/native'

const Months: string[] = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

const currentYear = new Date().getFullYear();
const Years: number[] = [currentYear, currentYear + 1, currentYear + 2]

// Payment window: 10 minutes (must match TEN_MIN_MS in the backend)
const PAYMENT_WINDOW_SECONDS = 10 * 60;

type Step = 'form' | 'pending' | 'confirmed' | 'expired';

const ConfirmBooking = () => {
  const nav: any = useNavigation();

  const currentProperty = useSelector((state: RootState) => state.property.currentProperty);
  const roomId = useSelector((state: RootState) => state.booking.data?.roomId);
  const roomName = useSelector((state: RootState) => state.booking.data?.roomName);
  const seatIndex = useSelector((state: RootState) => state.booking.data?.seatIndex);
  const pricePerSeat = useSelector((state: RootState) => state.booking.data?.pricePerSeat);

  // Date pickers
  const [fromDate, setFromDate] = useState(`${Years[0]}-${Months[0]}`);
  const [toDate, setToDate] = useState(`${Years[0]}-${Months[0]}`);
  const [duration, setDuration] = useState(0);

  // Flow state
  const [step, setStep] = useState<Step>('form');
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Countdown timer state
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_WINDOW_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute live total
  const total = useMemo(
    () => (parseFloat(pricePerSeat + '') * duration).toFixed(2),
    [pricePerSeat, duration]
  );

  // Recompute duration when dates change — using plain arithmetic (no dayjs plugin needed)
  useEffect(() => {
    const toMonthNumber = (value: string): number => {
      // value is "YYYY-Mon" e.g. "2026-Jan"
      const [year, monthLabel] = value.split('-');
      const monthIndex = Months.indexOf(monthLabel) + 1; // 1-12
      return parseInt(year) * 12 + monthIndex;
    };

    if (fromDate && toDate) {
      const diff = toMonthNumber(toDate) - toMonthNumber(fromDate);
      if (diff < 0) {
        setToDate(fromDate);
      } else {
        setDuration(diff);
      }
    }
  }, [fromDate, toDate]);

  // Convert "YYYY-MMM" picker value to "YYYY-MM" for the API
  const toApiMonth = (value: string): string => {
    const [year, monthLabel] = value.split('-');
    const monthIndex = Months.indexOf(monthLabel) + 1;
    return `${year}-${String(monthIndex).padStart(2, '0')}`;
  };

  // Start 10-minute countdown
  const startCountdown = (createdAt: string) => {
    const createdMs = new Date(createdAt).getTime();
    const expiresMs = createdMs + PAYMENT_WINDOW_SECONDS * 1000;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(timerRef.current!);
        setStep('expired');
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format seconds as MM:SS
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Step 1 — Create pending booking
  const handlePay = async () => {
    const safeSeatIndex = Number(seatIndex);
    if (!roomId || !safeSeatIndex || isNaN(safeSeatIndex) || duration < 1) {
      setError('Please select a valid lease period (at least 1 month).');
      return;
    }
    if (duration > 12) {
      setError('Maximum lease period is 12 months. Please select a shorter period.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const startMonth = toApiMonth(fromDate);
      console.log('Creating booking:', { roomId, safeSeatIndex, startMonth, duration });
      const result = await BookingAPI.createPending(
        roomId,
        safeSeatIndex,
        startMonth,
        duration,
      );
      setBooking(result);
      setStep('pending');
      startCountdown(result.createdAt);
    } catch (err: any) {
      // Extract the actual server message from any error shape
      const responseData = err?.response?.data;
      console.error('Booking API error:', JSON.stringify(responseData ?? err?.message));
      const msg: string =
        responseData?.message ??
        (Array.isArray(responseData?.errors) ? responseData.errors[0]?.message : null) ??
        responseData?.error ??
        err?.message ??
        '';
      if (msg.toLowerCase().includes('unavailable') || msg.toLowerCase().includes('conflict') || err?.response?.status === 409) {
        setError('This seat was just taken by someone else. Please go back and choose a different seat.');
      } else {
        setError(msg ? `Error: ${msg}` : 'Failed to create booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Confirm the pending booking
  const handleConfirm = async () => {
    if (!booking) return;
    setConfirmLoading(true);
    setError(null);
    try {
      await BookingAPI.confirmBooking(booking.id);
      if (timerRef.current) clearInterval(timerRef.current);
      setStep('confirmed');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? '';
      if (msg.toLowerCase().includes('expired')) {
        setStep('expired');
      } else {
        setError('Failed to confirm booking. Please try again.');
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  // ─── STEP: CONFIRMED ────────────────────────────────────────────
  if (step === 'confirmed') {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.WHITE, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 }}>
        <CheckCircle color={'#10B981'} size={72} />
        <Typography variant='h1' style={{ textAlign: 'center' }}>Booking Confirmed!</Typography>
        <Typography variant='body' style={{ textAlign: 'center', color: Colors.TEXT_GRAY }}>
          Your seat in {roomName} at {currentProperty?.title} is confirmed.
        </Typography>
        <RegularButton
          text='Done'
          Icon={null}
          marginTop={16}
          onPress={() => nav.navigate('Tab')}
        />
      </View>
    );
  }

  // ─── STEP: EXPIRED ──────────────────────────────────────────────
  if (step === 'expired') {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.WHITE, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 }}>
        <Clock color={Colors.TEXT_GRAY} size={72} />
        <Typography variant='h1' style={{ textAlign: 'center' }}>Booking Expired</Typography>
        <Typography variant='body' style={{ textAlign: 'center', color: Colors.TEXT_GRAY }}>
          Your 10-minute payment window has lapsed. The seat hold has been released. Please go back and try again.
        </Typography>
        <RegularButton
          text='Go Back'
          Icon={null}
          marginTop={16}
          onPress={() => nav.goBack()}
        />
      </View>
    );
  }

  // ─── STEP: PENDING — Countdown + Confirm button ─────────────────
  if (step === 'pending' && booking) {
    const isUrgent = secondsLeft < 60;
    return (
      <View style={{ flex: 1, backgroundColor: Colors.WHITE, padding: 16, gap: 16 }}>
        <ConfirmScreenHeader />

        {/* Countdown Banner */}
        <View style={{
          backgroundColor: isUrgent ? '#FEF2F2' : '#F0FDF4',
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          gap: 8,
          borderWidth: 1,
          borderColor: isUrgent ? '#FECACA' : '#BBF7D0',
        }}>
          <Clock color={isUrgent ? '#EF4444' : '#10B981'} size={32} />
          <Typography variant='h1' style={{ color: isUrgent ? '#EF4444' : '#10B981', fontSize: 40 }}>
            {formatCountdown(secondsLeft)}
          </Typography>
          <Typography variant='body' style={{ color: Colors.TEXT_GRAY, textAlign: 'center' }}>
            {isUrgent
              ? 'Hurry! Confirm before the seat is released.'
              : 'Confirm your booking within this window to secure your seat.'}
          </Typography>
        </View>

        {/* Booking Summary */}
        <View style={{ padding: 20, elevation: 1, borderRadius: 16, backgroundColor: Colors.WHITE, gap: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Typography variant='body' color={Colors.TEXT_GRAY}>Property</Typography>
            <Typography variant='h3'>{currentProperty?.title}</Typography>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Typography variant='body' color={Colors.TEXT_GRAY}>Room</Typography>
            <Typography variant='h3'>{roomName}</Typography>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Typography variant='body' color={Colors.TEXT_GRAY}>Seat</Typography>
            <Typography variant='h3'>#{seatIndex}</Typography>
          </View>
          <View style={{ height: 0.5, backgroundColor: Colors.BORDER_GRAY }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Typography variant='h1'>Total</Typography>
            <Typography variant='h1'>{formatNumberIntoCurrency(parseFloat(total))}</Typography>
          </View>
        </View>

        {error && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12 }}>
            <AlertCircle color={'#EF4444'} size={18} />
            <Typography variant='body' style={{ color: '#EF4444', flex: 1 }}>{error}</Typography>
          </View>
        )}

        <RegularButton
          Icon={<CheckCircle color={'white'} />}
          loading={confirmLoading}
          onPress={handleConfirm}
          text={'Confirm & Pay LKR ' + total}
        />
      </View>
    );
  }

  // ─── STEP: FORM — Pick lease period and press Pay ───────────────
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.WHITE }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <ConfirmScreenHeader />

      {/* Booking Details Card */}
      <View style={{ padding: 20, elevation: 1, borderRadius: 16, backgroundColor: Colors.WHITE, gap: 24, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant='body' color={Colors.TEXT_GRAY}>Property</Typography>
          <Typography variant='h3'>{currentProperty?.title}</Typography>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant='body' color={Colors.TEXT_GRAY}>Room</Typography>
          <Typography variant='h3'>{roomName}</Typography>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant='body' color={Colors.TEXT_GRAY}>Seat</Typography>
          <Typography variant='h3'>#{seatIndex}</Typography>
        </View>

        {/* Lease Period Pickers */}
        <View style={{ justifyContent: 'space-between' }}>
          <Typography variant='body' color={Colors.TEXT_GRAY}>Lease Period</Typography>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 10 }}>
            <Picker
              selectedValue={fromDate}
              style={{ backgroundColor: '#eee', width: '40%' }}
              mode='dropdown'
              onValueChange={(v) => setFromDate(v)}
            >
              {Years.map(year =>
                Months.map(month =>
                  <Picker.Item key={`${year}-${month}`} label={`${year}-${month}`} value={`${year}-${month}`} />
                )
              )}
            </Picker>
            <Typography variant='h1'> - </Typography>
            <Picker
              selectedValue={toDate}
              style={{ backgroundColor: '#eee', width: '40%' }}
              mode='dropdown'
              onValueChange={(v) => setToDate(v)}
            >
              {Years.map(year =>
                Months.map(month =>
                  <Picker.Item key={`${year}-${month}`} label={`${year}-${month}`} value={`${year}-${month}`} />
                )
              )}
            </Picker>
          </View>
        </View>

        <View style={{ height: 0.5, backgroundColor: Colors.BORDER_GRAY }} />

        {/* Price Breakdown */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant='body' color={Colors.TEXT_GRAY}>{'Price\nBreakdown'}</Typography>
          <Typography variant='body' color={Colors.TEXT_GRAY}>
            {formatNumberIntoCurrency(parseFloat(pricePerSeat + '')) + ' x ' + duration + '\nmonths'}
          </Typography>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant='h1'>Total</Typography>
          <Typography variant='h1'>{formatNumberIntoCurrency(parseFloat(total))}</Typography>
        </View>
      </View>

      {/* Validation / conflict error */}
      {error && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12 }}>
          <AlertCircle color={'#EF4444'} size={18} />
          <Typography variant='body' style={{ color: '#EF4444', flex: 1 }}>{error}</Typography>
        </View>
      )}

      <RegularButton
        Icon={<Lock color={'white'} />}
        loading={loading}
        disable={duration < 1}
        onPress={handlePay}
        text={'Pay LKR ' + total}
      />
      <Typography variant='caption' style={{ textAlign: 'center' }}>
        After paying, you will have 10 minutes to confirm your booking.
      </Typography>
    </ScrollView>
  );
}

export default ConfirmBooking