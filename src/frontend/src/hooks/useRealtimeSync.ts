import { useCabins } from "./useCabins";
import { useContainers } from "./useContainers";
import { usePainting } from "./usePainting";
import { useParking } from "./useParking";
import { useUnderparts } from "./useUnderparts";

export function useRealtimeSync() {
  const containers = useContainers();
  const cabins = useCabins();
  const painting = usePainting();
  const parking = useParking();
  const underparts = useUnderparts();

  return { containers, cabins, painting, parking, underparts };
}
