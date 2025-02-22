import { X } from "lucide-react";
import { useEffect } from "react";

interface NotificationProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
}

const Notification = ({ isVisible, message, onClose }: NotificationProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-zinc-950 text-white p-4 rounded-md shadow-md transition-transform transform translate-y-0">
      {message}
      <button onClick={onClose} className="ml-4 text-white">
        <X className="inline-block" />
      </button>
    </div>
  );
};

export default Notification;
