import { cn } from "@/lib/utils";

type ImageModalProps = {
  children: React.ReactNode;
  open: boolean;
  handleClose: () => void;
};

const Modal: React.FC<ImageModalProps> = ({ children, open }): JSX.Element => {
  return (
    <div
      className={cn("fixed left-0 top-0 z-10 w-full overflow-y-auto dark:bg-slate-950", {
        hidden: !open,
      })}
      id="modal"
    >
      <div className="min-height-100vh flex items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle"></span>
          <div
            className="align-center inline-block transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:align-middle"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            <div className="dark:border-slate-80 border border-slate-200 bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-slate-950">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
