import { useEffect, useState } from "react"
import { PropertyAPI } from "../api/properties"
import { PropertyItem } from "../types/properties"

export const useGetProperties = () => {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [page] = useState(1);

  useEffect(() => {
    PropertyAPI.getAllProperties(page, 10, "ALL" as any, { min: 0, max: 0 }, [], "").then((data: any) => {
      console.log("properties ", data)
      if (data && data.data) {
        setProperties(data.data)
      }
    }).catch(err => console.error(err));
  }, [])

  return {
    properties
  }
}

