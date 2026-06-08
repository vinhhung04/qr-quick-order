import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface OrderSuccessModalProps {
  open: boolean;
  onContinue: () => void;
}

export function OrderSuccessModal({ open, onContinue }: OrderSuccessModalProps) {
  return (
    <Modal open={open}>
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
        🎉
      </div>
      <h2 className="text-xl font-extrabold text-stone-900">Đã gửi order thành công!</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-500">
        Nhân viên sẽ tiếp nhận đơn của bạn trong ít phút. Cảm ơn bạn đã lựa chọn nhà hàng của chúng
        tôi 💛
      </p>
      <Button size="lg" className="mt-6 w-full" onClick={onContinue}>
        Tiếp tục gọi thêm món
      </Button>
    </Modal>
  );
}
