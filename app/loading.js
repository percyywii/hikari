import AnimeFigureLoader from "@/components/loadings/AnimeFigureLoader";

const Loading = () => {
  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center py-12">
      <AnimeFigureLoader />
    </div>
  );
};

export default Loading;