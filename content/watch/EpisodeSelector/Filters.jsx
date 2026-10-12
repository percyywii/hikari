import Select from "@/components/ui/Select";
import { useMemo } from "react";

const Filters = ({ setDubSelected, setEpFromTo, SplitedEpisodes, chunkSize, hasDub = true }) => {
  const dubOptions = useMemo(
    () => (hasDub ? ["sub & dub", "sub", "dub"] : ["sub"]),
    [hasDub]
  );

  const epRangeOptions = useMemo(
    () =>
      Array.from(
        { length: SplitedEpisodes?.length ?? 0 },
        (_, i) => `${i * chunkSize + 1} - ${(i + 1) * chunkSize}`
      ),
    [SplitedEpisodes?.length, chunkSize]
  );

  return (
    <div className="flex justify-between px-2 py-3 gap-4">
      <div className="w-full">
        <Select setSelected={setDubSelected} data={dubOptions} defaultValue={0} />
      </div>
      <div className="w-full">
        <Select
          setSelected={setEpFromTo}
          data={epRangeOptions}
          defaultValue={0}
        />
      </div>
    </div>
  );
};

export default Filters;
