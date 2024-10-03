import { SetStateAction } from "react";
import ImageCropModalContent from "./ImageCropModalContent";
import Modal from "./Modal";

type TCropModalProps = {
    setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
    isModalVisible: boolean;
    handleDone: () => void;
};

export const CropModal: React.FC<TCropModalProps> = ({
    setIsModalVisible,
    isModalVisible,
    handleDone,
}): JSX.Element => {
    return (
        <Modal open={isModalVisible} handleClose={() => setIsModalVisible(false)}>
            <ImageCropModalContent handleDone={handleDone} handleClose={() => setIsModalVisible(false)} />
        </Modal>
    );
};
