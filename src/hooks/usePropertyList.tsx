import { useCallback, useEffect, useState } from "react";
import { PropertyItem } from "../types/properties";
import { PropertyAPI } from "../api/properties";
import { PropertyType } from "../types/common";

export const usePropertyList = (
  currentPType: PropertyType,
  range: {
    min: number;
    max: number;
  },
  checkedCities: {
    city: string;
    checked: boolean;
  }[],
  triggerFilter: number,
  searchQuery: string = ""
) => {
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyItem[]>([]);

  const limit = 4; // Fetch 4 items per batch

  const fetchFirstBatch = useCallback(async () => {
    setInitialLoading(true);
    setError(null);
    setPage(1);

    try {
      const d = await PropertyAPI.getAllProperties(
        1,
        limit,
        currentPType,
        range,
        checkedCities,
        searchQuery
      );
      setProperties(d.data || []);
      setHasNext(d.meta.hasNextPage);
      if (d.meta.hasNextPage) {
        setPage(2);
      }
    } catch (err) {
      console.error("Failed to fetch property list", err);
      setError("Unable to load properties. Please check your connection and try again.");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [currentPType, triggerFilter, searchQuery]);

  useEffect(() => {
    fetchFirstBatch();
  }, [fetchFirstBatch]);

  const fetchNextBatch = async () => {
    if (!hasNext || fetchingMore || initialLoading) return;

    setFetchingMore(true);
    try {
      const d = await PropertyAPI.getAllProperties(
        page,
        limit,
        currentPType,
        range,
        checkedCities,
        searchQuery
      );
      setProperties((oldlist) => [...oldlist, ...d.data]);
      setHasNext(d.meta.hasNextPage);
      if (d.meta.hasNextPage) {
        setPage((p) => p + 1);
      }
    } catch (err) {
      console.error("Failed to fetch next batch", err);
    } finally {
      setFetchingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFirstBatch();
  };

  return {
    properties,
    initialLoading,
    fetchingMore,
    refreshing,
    error,
    fetchNextBatch,
    refetch: fetchFirstBatch,
    handleRefresh,
  };
};