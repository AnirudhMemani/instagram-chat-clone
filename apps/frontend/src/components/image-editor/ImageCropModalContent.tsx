import { readFile } from "./helpers/cropImage";
import { useImageCropContext } from "./ImageCropProvider";
import Cropper from "./Cropper";
import { RotationSlider, ZoomSlider } from "./Sliders";
import { Button } from "../ui/button";

type TImageCropModalContentProps = {
    handleDone: () => void;
    handleClose: () => void;
};

const ImageCropModalContent: React.FC<TImageCropModalContentProps> = ({ handleDone, handleClose }) => {
    const { setImage } = useImageCropContext();

    type ThandleFileChange = React.ChangeEvent<HTMLInputElement>;

    const handleFileChange = async ({ target: { files } }: ThandleFileChange) => {
        const file = files && files[0];
        if (!file) {
            return;
        }
        const imageDataUrl = await readFile(file);
        setImage(imageDataUrl);
    };

    return (
        <div className="text-center relative">
            <h5 className="text-gray-800 dark:text-white mb-4">Edit profile picture</h5>
            <div className="border dark:border-gray-700 border-white p-6 rounded-lg">
                <div className="flex justify-center">
                    <div className="crop-container mb-4">
                        <Cropper />
                    </div>
                </div>
                <ZoomSlider className="mb-4" />
                <RotationSlider className="mb-4" />
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatarInput"
                    accept="image/*"
                />

                <Button variant="secondary" className="shadow w-full mb-4 hover:shadow-lg">
                    <label htmlFor="avatarInput">Upload Another Picture</label>
                </Button>
                <div className="flex gap-2">
                    <Button variant="destructive" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={handleDone}>
                        Done & Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModalContent;
