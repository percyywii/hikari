import { IoPersonOutline, IoSettingsOutline } from "react-icons/io5";
import { FaBrush } from "react-icons/fa6";
import { BiLogoPlayStore } from "react-icons/bi";
import { IoMdLink } from "react-icons/io";

const TypeSelector = ({ isLoggedIn }) => {
  let types = [
    {
      name: "Account",
      icon: <IoPersonOutline />,
      requirelogin: true,
    },
    {
      name: "Appearance",
      icon: <FaBrush />,
    },
    {
      name: "Preferences",
      icon: <IoSettingsOutline />,
    },
    {
      name: "Watch Page",
      icon: <BiLogoPlayStore />,
    },
    {
      name: "App Information",
      icon: <IoMdLink />,
    },
  ];

  return (
    <div className="max-w-72 w-full fixed select-none">
      <div className="text-slate-900 dark:text-white font-['Outfit'] font-bold text-xl mb-4">
        Settings
      </div>

      <div className="flex flex-col gap-1.5 mt-2">
        {types.map((d, i) => (
          <div
            key={i}
            className="flex gap-3 items-center text-sm font-semibold py-2.5 px-3 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <div className="text-lg text-cyan-500">{d?.icon}</div>
            <div className="font-['Outfit']">{d?.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypeSelector;