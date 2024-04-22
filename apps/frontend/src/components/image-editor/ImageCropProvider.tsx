import { createContext, useCallback, useContext, useState } from "react";
import getCroppedImg from "./helpers/cropImage";

type TImageCropContext = {
    image?: any;
    setImage?: any;
    zoom?: any;
    setZoom?: any;
    rotation?: any;
    setRotation?: any;
    crop?: any;
    setCrop?: any;
    croppedAreaPixels?: any;
    setCroppedAreaPixels?: any;
    onCropComplete?: any;
    getProcessedImage?: any;
    handleZoomIn?: any;
    handleZoomOut?: any;
    handleRotateAntiCw?: any;
    handleRotateCw?: any;
    max_zoom?: any;
    min_zoom?: any;
    zoom_step?: any;
    max_rotation?: any;
    min_rotation?: any;
    rotation_step?: any;
    resetStates?: any;
};

export const ImageCropContext = createContext<TImageCropContext>({});

const defaultImage = null;
const defaultCrop = { x: 0, y: 0 };
const defaultRotation = 0;
const defaultZoom = 1;
const defaultCroppedAreaPixels = null;

type ImageCropProviderProps = {
    children?: React.ReactNode;
    max_zoom?: number;
    min_zoom?: number;
    zoom_step?: number;
    max_rotation?: number;
    min_rotation?: number;
    rotation_step?: number;
};

const ImageCropProvider: React.FC<ImageCropProviderProps> = ({
    children,
    max_zoom = 3,
    min_zoom = 1,
    zoom_step = 0.1,
    max_rotation = 360,
    min_rotation = 0,
    rotation_step = 5,
}) => {
    const [image, setImage] = useState(defaultImage);
    const [crop, setCrop] = useState(defaultCrop);
    const [rotation, setRotation] = useState(defaultRotation);
    const [zoom, setZoom] = useState(defaultZoom);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(
        defaultCroppedAreaPixels
    );

    const onCropComplete = useCallback(
        (_croppedArea: any, croppedAreaPixels: any) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleZoomIn = () => {
        if (zoom < max_zoom) {
            setZoom(zoom + zoom_step * 2);
        }
    };

    const handleZoomOut = () => {
        if (zoom > min_zoom) {
            setZoom(zoom - zoom_step * 2);
        }
    };

    const handleRotateCw = () => {
        setRotation(rotation + rotation_step);
    };

    const handleRotateAntiCw = () => {
        setRotation(rotation - rotation_step);
    };

    const getProcessedImage = async () => {
        if (image && croppedAreaPixels) {
            const croppedImage = await getCroppedImg(
                image,
                croppedAreaPixels,
                rotation
            );

            if (!croppedImage?.file) {
                return;
            }

            const imageFile = new File(
                [croppedImage.file],
                `img-${Date.now()}.png`,
                {
                    type: "image/png",
                }
            );
            return imageFile;
        }
    };

    const resetStates = () => {
        setImage(defaultImage);
        setCrop(defaultCrop);
        setRotation(defaultRotation);
        setZoom(defaultZoom);
        setCroppedAreaPixels(defaultCroppedAreaPixels);
    };

    return (
        <ImageCropContext.Provider
            value={{
                image,
                setImage,
                zoom,
                setZoom,
                rotation,
                setRotation,
                crop,
                setCrop,
                croppedAreaPixels,
                setCroppedAreaPixels,
                onCropComplete,
                getProcessedImage,
                handleZoomIn,
                handleZoomOut,
                handleRotateAntiCw,
                handleRotateCw,
                max_zoom,
                min_zoom,
                zoom_step,
                max_rotation,
                min_rotation,
                rotation_step,
                resetStates,
            }}
        >
            {children}
        </ImageCropContext.Provider>
    );
};

export const useImageCropContext = () => useContext(ImageCropContext);

export default ImageCropProvider;
