import { useImageCropContext } from "./ImageCropProvider";
import { CornerUpLeft, CornerUpRight, MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const ZoomSlider = ({ className }: { className: string }) => {
    const {
        zoom,
        setZoom,
        handleZoomIn,
        handleZoomOut,
        max_zoom,
        min_zoom,
        zoom_step,
    } = useImageCropContext();

    return (
        <div
            className={cn(className, "flex items-center justify-center gap-2")}
        >
            <button className="p-1" onClick={handleZoomOut}>
                <MinusIcon className="text-gray-400 w-4" />
            </button>
            <input
                type="range"
                name="volju"
                min={min_zoom}
                max={max_zoom}
                step={zoom_step}
                value={zoom}
                onChange={(e) => {
                    setZoom(Number(e.target.value));
                }}
            />
            <button className="p-1" onClick={handleZoomIn}>
                <PlusIcon className="text-gray-400 w-4" />
            </button>
        </div>
    );
};

export const RotationSlider = ({ className }: { className: string }) => {
    const {
        rotation,
        setRotation,
        max_rotation,
        min_rotation,
        rotation_step,
        handleRotateAntiCw,
        handleRotateCw,
    } = useImageCropContext();

    return (
        <div
            className={cn(className, "flex items-center justify-center gap-2")}
        >
            <button className="p-1" onClick={handleRotateAntiCw}>
                <CornerUpLeft className="text-gray-400 w-4" />
            </button>
            <input
                type="range"
                name="volju"
                min={min_rotation}
                max={max_rotation}
                step={rotation_step}
                value={rotation}
                onChange={(e) => {
                    setRotation(Number(e.target.value));
                }}
            />
            <button className="p-1" onClick={handleRotateCw}>
                <CornerUpRight className="text-gray-400 w-4" />
            </button>
        </div>
    );
};
