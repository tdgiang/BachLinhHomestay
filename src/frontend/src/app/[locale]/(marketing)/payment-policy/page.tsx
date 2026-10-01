import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  LegalDocument,
  type LegalDocumentData,
} from "@/components/marketing/LegalDocument";

export const metadata: Metadata = {
  title: "Chính sách thanh toán",
  description:
    "Chính sách về thanh toán áp dụng trên website thương mại điện tử bachlinh.com.vn — phương thức thanh toán, thời hạn xác nhận và xuất hóa đơn.",
};

type Props = { params: Promise<{ locale: string }> };

const DOC: LegalDocumentData = {
  title: "Chính sách về thanh toán",
  scope: "Áp dụng trên website thương mại điện tử bachlinh.com.vn",
  bases: [
    "Căn cứ Luật Thương mại số 36/2005/QH11 ngày 14/06/2005;",
    "Căn cứ Luật Bảo vệ quyền lợi người tiêu dùng số 59/2010/QH12 ngày 17/11/2010;",
    "Căn cứ Nghị định số 52/2013/NĐ-CP ngày 16/05/2013 và Nghị định số 85/2021/NĐ-CP ngày 25/09/2021 của Chính phủ về thương mại điện tử;",
    "Căn cứ Giấy chứng nhận ĐKDN số 0111484606 do Sở Kế hoạch và Đầu tư TP. Hà Nội cấp;",
  ],
  articles: [
    {
      id: "pham-vi",
      title: "Điều 1. Phạm vi và nguyên tắc áp dụng",
      blocks: [
        "1.1. Chính sách này áp dụng đối với tất cả khách hàng thực hiện giao dịch đặt phòng dịch vụ lưu trú homestay trên website thương mại điện tử bachlinh.com.vn thuộc Công ty Cổ phần Sản xuất Thương mại Dịch vụ Bách Linh.",
        "1.2. Mọi giao dịch thanh toán trên nền tảng đều được bảo đảm tính công khai, minh bạch, bảo mật tuyệt đối thông tin tài khoản và phù hợp với các quy định của pháp luật Việt Nam về thanh toán điện tử.",
      ],
    },
    {
      id: "phuong-thuc",
      title: "Điều 2. Các phương thức thanh toán được hỗ trợ",
      blocks: [
        "Khách hàng có thể lựa chọn một trong các hình thức thanh toán thuận tiện sau khi đặt phòng tại bachlinh.com.vn:",
        {
          label: "1. Chuyển khoản ngân hàng:",
          text: "Khách hàng chuyển khoản số tiền đặt phòng tương ứng vào tài khoản ngân hàng chính thức của Công ty Bách Linh theo thông tin hiển thị trên màn hình xác nhận đơn đặt phòng. Nội dung chuyển khoản ghi rõ: [Mã đặt phòng] - [Họ tên khách hàng] - [Số điện thoại]. Giao dịch được xác nhận ngay khi tiền vào tài khoản công ty.",
        },
        {
          label: "2. Thanh toán trực tuyến bằng thẻ quốc tế (Visa / MasterCard / JCB):",
          text: "Hệ thống hỗ trợ thanh toán qua thẻ quốc tế thông qua cổng thanh toán trung gian được cấp phép. Mọi thông tin thẻ của khách hàng được mã hóa an toàn theo tiêu chuẩn bảo mật quốc tế SSL/TLS, Bách Linh không trực tiếp lưu trữ mã bảo mật CVC/CVV của khách hàng.",
        },
        {
          label: "3. Thanh toán qua ví điện tử (MoMo, ZaloPay, VNPay):",
          text: "Khách hàng có thể quét mã QR code hoặc xác nhận thanh toán trực tiếp qua ứng dụng ví điện tử tương ứng liên kết trên hệ thống.",
        },
        {
          label: "4. Thanh toán trực tiếp tại cơ sở homestay (khi nhận phòng):",
          text: "Áp dụng đối với các đặt phòng được chính sách cơ sở cho phép trả sau. Khách hàng thanh toán số tiền còn lại bằng tiền mặt hoặc chuyển khoản tại quầy/với quản lý homestay khi làm thủ tục check-in.",
        },
      ],
    },
    {
      id: "xac-nhan",
      title: "Điều 3. Thời hạn và quy trình xác nhận thanh toán",
      blocks: [
        "3.1. Đối với hình thức thanh toán chuyển khoản hoặc trực tuyến, khách hàng cần hoàn tất thanh toán trong thời hạn giữ chỗ được hiển thị trên hệ thống (thông thường là 30 phút kể từ lúc đặt lệnh). Quá thời hạn này, lệnh đặt phòng sẽ tự động hủy trên hệ thống.",
        "3.2. Ngay sau khi nhận được thanh toán thành công, hệ thống bachlinh.com.vn sẽ tự động gửi Email và tin nhắn SMS xác nhận đặt phòng kèm theo Mã đặt phòng duy nhất cùng hướng dẫn nhận phòng cho khách hàng.",
      ],
    },
    {
      id: "hoa-don",
      title: "Điều 4. Xuất hóa đơn tài chính",
      blocks: [
        "4.1. Khách hàng có nhu cầu xuất hóa đơn giá trị gia tăng (VAT) hợp lệ cần cung cấp đầy đủ thông tin doanh nghiệp (Tên công ty, Mã số thuế, Địa chỉ, Email nhận hóa đơn điện tử) tại bước đặt phòng hoặc thông báo cho Bách Linh trong vòng 24 giờ sau khi thanh toán.",
        "4.2. Hóa đơn điện tử sẽ được khởi tạo và gửi trực tiếp qua email của khách hàng theo quy định của Tổng cục Thuế.",
      ],
    },
  ],
};

export default async function PaymentPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LegalDocument doc={DOC} currentHref="/payment-policy" />;
}
