"use client";

import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import Checkbox from "../components/Checkbox";
import { Fragment, useState } from "react";

const Genres = ({ genresitem: checkBoxItem, setGenres: setCheckBoxItem }) => {
  const [isOpened, setIsOpened] = useState(true);

  const genres = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Ecchi",
    "Fantasy",
    "Horror",
    "Shoujo",
    "Mecha",
    "Music",
    "Mystery",
    "Psychological",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Thriller",
  ];

  return (
    <div>
      <div
        className="flex justify-between items-center cursor-pointer border-b border-slate-200 dark:border-[#1E2235] pb-2 mt-4 select-none"
        onClick={() => setIsOpened((prev) => !prev)}
      >
        <div className="text-slate-900 dark:text-slate-100 font-semibold font-['Outfit'] text-sm">
          Genres
        </div>
        <div className="text-slate-400">
          {isOpened ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </div>
      </div>

      {isOpened ? (
        <div className="mt-3 px-1 flex flex-col gap-2 max-h-56 overflow-y-auto">
          {genres?.map((item) => (
            <Fragment key={item}>
              <Checkbox
                title={item}
                checkBoxItem={checkBoxItem}
                setCheckBoxItem={setCheckBoxItem}
                multipleSelect
              />
            </Fragment>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Genres;