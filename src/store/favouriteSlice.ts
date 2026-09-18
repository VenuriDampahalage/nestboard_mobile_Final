import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PropertyItem } from '../types/properties';
import { PropertyAPI } from '../api/properties';
import { RootState } from './store';
import { Alert } from 'react-native';

export interface FavouriteState {
  favouriteIds: Record<string, boolean>;
  favourites: PropertyItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

const initialState: FavouriteState = {
  favouriteIds: {},
  favourites: [],
  loading: false,
  refreshing: false,
  error: null,
};

export const fetchFavourites = createAsyncThunk(
  'favourite/fetchFavourites',
  async (isRefresh: boolean | undefined, { dispatch }) => {
    try {
      if (isRefresh) {
        dispatch(setRefreshing(true));
      } else {
        dispatch(setLoading(true));
      }
      dispatch(setError(null));

      const data = await PropertyAPI.getMyFavourites();
      dispatch(setFavourites(data));
      return data;
    } catch (err: any) {
      console.error('Failed to fetch favourites', err);
      dispatch(setError(err?.response?.data?.message || 'Failed to load saved properties.'));
      throw err;
    } finally {
      dispatch(setLoading(false));
      dispatch(setRefreshing(false));
    }
  }
);

export const togglePropertyFavorite = createAsyncThunk(
  'favourite/togglePropertyFavorite',
  async (
    property: {
      id: string;
      title?: string;
      location?: string;
      address?: string;
      type?: string;
      price?: string;
      rating?: number | string;
      image?: string;
      imageUrl?: string;
      lat?: number;
      latitude?: number;
      lng?: number;
      longitude?: number;
      isFavorite?: boolean;
    },
    { getState, dispatch }
  ) => {
    const state = getState() as RootState;
    const currentStatus =
      state.favourite.favouriteIds[property.id] ?? property.isFavorite ?? false;
    const nextStatus = !currentStatus;

    // Normalizing PropertyItem for store
    const normalizedItem: PropertyItem = {
      id: property.id,
      title: property.title || '',
      location: property.location || property.address || '',
      type: property.type || '',
      price: property.price || '',
      rating: typeof property.rating === 'string' ? parseFloat(property.rating) || 0 : property.rating || 0,
      image: property.image || property.imageUrl || '',
      lat: property.lat ?? property.latitude ?? 0,
      lng: property.lng ?? property.longitude ?? 0,
      isFavorite: nextStatus,
    };

    const existingIndex = state.favourite.favourites.findIndex((p) => p.id === property.id);
    const previousItem = existingIndex >= 0 ? state.favourite.favourites[existingIndex] : undefined;

    // 1. Optimistic update
    dispatch(
      toggleOptimistic({
        id: property.id,
        nextStatus,
        property: normalizedItem,
      })
    );

    try {
      // 2. Call backend API
      const response = await PropertyAPI.toggleFavorite(property.id);
      // 3. Reconcile with actual server response
      dispatch(
        syncFavoriteStatus({
          id: property.id,
          isFavorite: response.isFavorite,
        })
      );
      return response;
    } catch (err: any) {
      console.error('Failed to toggle favorite', err);
      // 4. Rollback on failure
      dispatch(
        toggleRollback({
          id: property.id,
          previousStatus: currentStatus,
          previousItem,
          previousIndex: existingIndex,
        })
      );
      Alert.alert('Notice', 'Could not update favorites. Please try again.');
      throw err;
    }
  }
);

export const favouriteSlice = createSlice({
  name: 'favourite',
  initialState,
  reducers: {
    setFavourites: (state, action: PayloadAction<PropertyItem[]>) => {
      state.favourites = action.payload;
      const ids: Record<string, boolean> = {};
      action.payload.forEach((item) => {
        ids[item.id] = true;
      });
      state.favouriteIds = { ...state.favouriteIds, ...ids };
    },
    syncFavoriteStatus: (
      state,
      action: PayloadAction<{ id: string; isFavorite: boolean }>
    ) => {
      const { id, isFavorite } = action.payload;
      state.favouriteIds[id] = isFavorite;
      if (!isFavorite) {
        state.favourites = state.favourites.filter((p) => p.id !== id);
      }
    },
    toggleOptimistic: (
      state,
      action: PayloadAction<{
        id: string;
        nextStatus: boolean;
        property?: PropertyItem;
      }>
    ) => {
      const { id, nextStatus, property } = action.payload;
      state.favouriteIds[id] = nextStatus;

      if (!nextStatus) {
        state.favourites = state.favourites.filter((p) => p.id !== id);
      } else if (property) {
        const exists = state.favourites.some((p) => p.id === id);
        if (!exists) {
          state.favourites.unshift(property);
        }
      }
    },
    toggleRollback: (
      state,
      action: PayloadAction<{
        id: string;
        previousStatus: boolean;
        previousItem?: PropertyItem;
        previousIndex?: number;
      }>
    ) => {
      const { id, previousStatus, previousItem, previousIndex } = action.payload;
      state.favouriteIds[id] = previousStatus;

      if (previousStatus && previousItem) {
        const exists = state.favourites.some((p) => p.id === id);
        if (!exists) {
          if (
            previousIndex !== undefined &&
            previousIndex >= 0 &&
            previousIndex <= state.favourites.length
          ) {
            state.favourites.splice(previousIndex, 0, previousItem);
          } else {
            state.favourites.push(previousItem);
          }
        }
      } else if (!previousStatus) {
        state.favourites = state.favourites.filter((p) => p.id !== id);
      }
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
});

export const {
  setFavourites,
  syncFavoriteStatus,
  toggleOptimistic,
  toggleRollback,
  setLoading,
  setRefreshing,
  setError,
} = favouriteSlice.actions;

export default favouriteSlice.reducer;
