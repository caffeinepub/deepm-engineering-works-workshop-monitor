import { useCabins } from "./useCabins";
import { useContainers } from "./useContainers";
import { useDelivery } from "./useDelivery";
import { usePainting } from "./usePainting";
import { useParking } from "./useParking";
import { useUnderparts } from "./useUnderparts";
import { useWorkOrders } from "./useWorkOrders";

export function useRealtimeSync() {
  const containers = useContainers();
  const cabins = useCabins();
  const painting = usePainting();
  const parking = useParking();
  const underparts = useUnderparts();
  const delivery = useDelivery();
  const workOrders = useWorkOrders();

  return {
    containers,
    cabins,
    painting,
    parking,
    underparts,
    delivery,
    workOrders,
  };
}
