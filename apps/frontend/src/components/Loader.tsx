import "../styles/loader.css";

const bars = Array(12).fill(0);

export const Loader = ({ visible }: { visible: boolean }) => {
  if (visible)
    return (
      <div className="sonner-loading-wrapper" data-visible={visible}>
        <div className="sonner-spinner">
          {bars.map((_, i) => (
            <div className={"sonner-loading-bar !bg-black dark:!bg-white"} key={`spinner-bar-${i}`} />
          ))}
        </div>
      </div>
    );
};
