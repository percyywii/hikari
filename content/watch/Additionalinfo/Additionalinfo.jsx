"use client";

import { useState } from "react";
import Characters from "./Characters/Characters";
import clsx from "clsx";
import Relations from "./Relations/Relations";

const Additionalinfo = ({ info }) => {
  const [active, setActive] = useState("Relation");
  const links = ["Characters", "Relation", "Comments"];

  return (
    <div className="mt-8 mb-16 w-full transition-colors">
      <div className="flex w-full relative gap-2 border-b border-slate-200/80 dark:border-[#212029]">
        {links.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              item !== "Comments"
                ? setActive(item)
                : document.getElementById("comment")?.scrollIntoView({ behavior: "smooth" })
            }
            className={clsx(
              "px-4 py-2.5 text-base sm:text-lg font-semibold relative transition-colors cursor-pointer select-none",
              item === active
                ? "text-cyan-600 dark:text-cyan-400 after:content-[''] after:absolute after:w-full after:bottom-0 after:left-0 after:h-[2.5px] after:bg-cyan-500 after:rounded-full after:z-10"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {active === "Characters" ? <Characters info={info} /> : null}
        {active === "Relation" ? <Relations info={info} setActive={setActive} /> : null}
      </div>
    </div>
  );
};

export default Additionalinfo;