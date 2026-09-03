import { PropertyType } from "../types/common";
import { Property, PropertyItem, PropertyListResponse, PropertyLocation, RoomType } from "../types/properties";
import { apiClient } from "./apiClient"

export const PropertyAPI = {

  getAllProperties: async (
    page: number,
    limit: number,
    type: PropertyType,
    range: {
      min: number;
      max: number;
    },
    checkedCities: {
      city: string;
      checked: boolean;
    }[],
    searchQuery: string = ""
  ) => {
    const params = new URLSearchParams();
    params.append("page", page + "");
    params.append("limit", limit + "");

    // Resolve type: Omit if 'All' or empty
    if (type && type.toLowerCase() !== "all") {
      params.append("type", type.toLowerCase());
    }

    // Resolve search parameter
    if (searchQuery && searchQuery.trim().length > 0) {
      params.append("search", searchQuery.trim());
    }

    // Resolve price range
    if (range && range.max > 0) {
      params.append("minPrice", range.min + "");
      params.append("maxPrice", range.max + "");
    }

    // Resolve checked cities filter
    const activeCities = checkedCities
      .filter((c) => c.checked)
      .map((c) => c.city);

    if (activeCities.length > 0) {
      params.append("city", activeCities.join(","));
    }

    const d = await apiClient.get<PropertyListResponse>("properties?" + params.toString());
    return d.data;
  },

  getSingleProperty: async (id: string) => {
    const d = await apiClient.get<Property>('properties/' + id)
    return d.data;
  },

  getPropertyRoomTypes: async (id: string) => {
    const d = await apiClient.get<RoomType[]>('properties/' + id + '/room-types')
    return d.data;
  },

  getSingleRoomType: async (proprtyId: string, roomTypeId: string) => {
    const d = await apiClient.get<RoomType>(`properties/${proprtyId}/room-types/${roomTypeId}`)
    return d.data;
  },

  getMapList: async () => {
    const d = await apiClient.get<PropertyLocation[]>(`properties/map-list`)
    return d.data;
  },

}