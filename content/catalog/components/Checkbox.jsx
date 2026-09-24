"use client";

import { FaCheck } from "react-icons/fa6";
import { motion } from "framer-motion";

const Checkbox = ({ title, checkBoxItem, setCheckBoxItem, multipleSelect }) => {
  const isSelected = multipleSelect
    ? checkBoxItem?.includes(title)
    : checkBoxItem === title;

  const handleCheckBoxChange = () => {
    if (multipleSelect) {
      if (checkBoxItem?.includes(title)) {
        setCheckBoxItem(checkBoxItem.filter((item) => item !== title));
      } else {
        setCheckBoxItem([...(checkBoxItem || []), title]);
      }
    } else {
      setCheckBoxItem(title === checkBoxItem ? "" : title);
    }
  };

  return (
    <div
      className="flex gap-2.5 items-center cursor-pointer select-none group py-0.5"
      onClick={handleCheckBoxChange}
    >
      <div
        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] transition-all border ${
          isSelected
            ? "bg-cyan-500 border-cyan-500 text-white shadow-sm shadow-cyan-500/30"
            : "bg-slate-100 dark:bg-[#161926] border-slate-300 dark:border-[#23283E] text-transparent group-hover:border-cyan-500/50"
        }`}
      >
        {isSelected && (
          <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
            <FaCheck />
          </motion.div>
        )}
      </div>
      <span className="text-slate-700 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 font-['Outfit'] text-xs sm:text-sm font-medium transition-colors">
        {title}
      </span>
    </div>
  );
};

export default Checkbox;