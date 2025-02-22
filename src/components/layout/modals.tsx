import { FC } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  inputValue,
  onInputChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-zinc-800 rounded-md p-6 w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {message && <p className="mb-4 text-gray-300">{message}</p>}
        {onInputChange && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            className="w-full p-2 mb-4 border border-zinc-700 rounded-md bg-zinc-800 text-white"
            placeholder="Digite o novo nome"
          />
        )}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 text-white"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
