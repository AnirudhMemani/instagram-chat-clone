import { useState } from "react";
import user1 from "../../assets/react.svg";
import { readFile } from "./helpers/cropImage";
import ImageCropModalContent from "./ImageCropModalContent";
import { useImageCropContext } from "./ImageCropProvider";
import Modal from "./Modal";

const ImageCrop = () => {
    const [openModal, setOpenModal] = useState(false);
    const [preview, setPreview] = useState(user1);

    const { getProcessedImage, setImage, resetStates } = useImageCropContext();

    const handleDone = async () => {
        const avatar = await getProcessedImage();
        setPreview(window.URL.createObjectURL(avatar));
        resetStates();
        setOpenModal(false);
    };

    type ThandleFileChange = React.ChangeEvent<HTMLInputElement>;

    const handleFileChange = async ({
        target: { files },
    }: ThandleFileChange) => {
        const file = files && files[0];
        if (!file) {
            return;
        }
        const imageDataUrl = await readFile(file);
        setImage(imageDataUrl);
        setOpenModal(true);
    };

    return (
        <div className="bg-gray-100 h-screen flex justify-center items-center">
            <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="avatarInput"
                accept="image/*"
            />
            <label
                htmlFor="avatarInput"
                className="cursor-pointer"
            >
                <img
                    src={preview}
                    height={192}
                    width={192}
                    className="object-cover rounded-full h-48 w-48"
                    alt=""
                />
            </label>

            <Modal
                open={openModal}
                handleClose={() => setOpenModal(false)}
            >
                <ImageCropModalContent
                    handleDone={handleDone}
                    handleClose={() => setOpenModal(false)}
                />
            </Modal>
        </div>
    );
};

export default ImageCrop;
