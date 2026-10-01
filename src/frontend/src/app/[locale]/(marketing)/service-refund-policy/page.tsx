import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  LegalDocument,
  type LegalDocumentData,
} from "@/components/marketing/LegalDocument";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Phương thức cung cấp dịch vụ & chính sách hoàn tiền",
  description:
    "Phương thức cung cấp dịch vụ, chính sách chấm dứt dịch vụ và hoàn tiền áp dụng trên website thương mại điện tử bachlinh.com.vn.",
};

type Props = { params: Promise<{ locale: string }> };

const DOC: LegalDocumentData = {
  title: "Phương thức cung cấp dịch vụ, chính sách chấm dứt dịch vụ và hoàn tiền",
  scope: "Áp dụng trên website thương mại điện tử bachlinh.com.vn",
  bases: [
    "Căn cứ Luật Thương mại số 36/2005/QH11 ngày 14/06/2005;",
    "Căn cứ Luật Bảo vệ quyền lợi người tiêu dùng số 59/2010/QH12 ngày 17/11/2010;",
    "Căn cứ Nghị định số 52/2013/NĐ-CP ngày 16/05/2013 và Nghị định số 85/2021/NĐ-CP ngày 25/09/2021 của Chính phủ về thương mại điện tử;",
    "Căn cứ Giấy chứng nhận ĐKDN số 0111484606 do Sở Kế hoạch và Đầu tư TP. Hà Nội cấp;",
  ],
  articles: [
    {
      id: "cung-cap-dich-vu",
      title: "Điều 1. Phương thức cung cấp dịch vụ lưu trú",
      blocks: [
        "Dịch vụ lưu trú homestay trên website bachlinh.com.vn được cung cấp tuần tự qua các giai đoạn sau:",
        {
          label: "1. Tiếp nhận và xử lý yêu cầu đặt dịch vụ:",
          text: "Khách hàng lựa chọn điểm đến, cơ sở homestay, loại phòng, thời gian lưu trú và số lượng khách, sau đó tiến hành xác nhận đặt phòng và thực hiện thanh toán trên website bachlinh.com.vn.",
        },
        {
          label: "2. Phương thức chuyển giao thông tin xác nhận:",
          text: "Ngay sau khi đơn hàng đặt thành công, hệ thống bachlinh.com.vn sẽ tự động gửi xác nhận chính thức qua Email và tin nhắn SMS đến số điện thoại mà khách hàng đăng ký. Nội dung xác nhận bao gồm: Mã đặt phòng, tên cơ sở, địa chỉ chi tiết, thông tin liên hệ của quản lý, khung giờ nhận/trả phòng và mã số thanh toán hợp lệ.",
        },
        {
          label: "3. Phương thức bàn giao phòng thực tế tại cơ sở:",
          text: "Khi khách hàng đến cơ sở homestay theo thời gian đã đăng ký, nhân viên quản lý/chủ nhà sẽ trực tiếp đón tiếp tại chỗ, tiến hành đối chiếu mã đặt phòng, kiểm tra giấy tờ CCCD/Hộ chiếu theo quy định, bàn giao chìa khóa phòng và hướng dẫn trực tiếp cho khách hàng về trang thiết bị tiện nghi trong phòng.",
        },
      ],
    },
    {
      id: "huy-dat-phong",
      title: "Điều 2. Chính sách hủy đặt phòng và chấm dứt dịch vụ",
      blocks: [
        "2.1. Nhằm bảo đảm tính linh hoạt và phù hợp với đặc thù của từng loại hình homestay, chính sách hủy phòng và mức hoàn trả cụ thể được chủ cơ sở lưu trú (Host) quyết định và trao đổi trực tiếp, thống nhất với khách hàng tại thời điểm đặt phòng.",
        `2.2. Khi khách hàng có nhu cầu thay đổi ngày lưu trú hoặc hủy đơn đặt phòng, khách hàng cần chủ động liên hệ trực tiếp với Host hoặc liên hệ hotline của Bách Linh (${COMPANY.hotline}) càng sớm càng tốt để được hỗ trợ thương lượng phương án tối ưu.`,
        "2.3. Khách hàng đơn phương chấm dứt hợp đồng dịch vụ không báo trước hoặc không đến nhận phòng (No-show) vào ngày quy định mà không có lý do chính đáng sẽ chịu mất toàn bộ số tiền đặt cọc/tiền phòng theo thỏa thuận.",
      ],
    },
    {
      id: "hoan-tien",
      title: "Điều 3. Chính sách hoàn tiền",
      blocks: [
        "3.1. Điều kiện hoàn tiền: Khách hàng được hoàn trả lại tiền phòng trong các trường hợp:",
        {
          items: [
            "Hủy đặt phòng hợp lệ và đủ điều kiện hoàn trả theo thỏa thuận trực tiếp đã thống nhất với chủ cơ sở lưu trú;",
            "Cơ sở homestay không thể cung cấp phòng đúng tiêu chuẩn đã xác nhận do lỗi từ phía cơ sở và hai bên không thể thỏa thuận được giải pháp thay thế tương đương;",
            "Trường hợp bất khả kháng theo quy định tại Điều 4 Chính sách này.",
          ],
        },
        "3.2. Phương thức hoàn tiền: Khoản tiền hoàn lại sẽ được chuyển trả trực tiếp cho khách hàng thông qua chính phương thức mà khách hàng đã sử dụng để thanh toán trước đó (chuyển khoản lại vào tài khoản ngân hàng, ví điện tử hoặc hoàn tiền mặt trực tiếp).",
        "3.3. Thời hạn xử lý hoàn tiền: Quá trình đối soát và hoàn tiền sẽ được Bách Linh cùng cơ sở lưu trú thực hiện nhanh chóng, đảm bảo không quá 30 ngày kể từ ngày các bên thống nhất bằng văn bản/tin nhắn xác nhận hủy phòng hợp lệ.",
      ],
    },
    {
      id: "bat-kha-khang",
      title: "Điều 4. Xử lý trong trường hợp bất khả kháng",
      blocks: [
        "Trong các trường hợp bất khả kháng nằm ngoài tầm kiểm soát của các bên như: thiên tai bão lũ lớn, động đất, dịch bệnh bùng phát dẫn đến lệnh phong tỏa, cách ly hoặc quyết định cấm di chuyển của cơ quan nhà nước có thẩm quyền:",
        {
          items: [
            "Hai bên cùng nhau thương lượng trên tinh thần thiện chí;",
            "Khách hàng sẽ được hỗ trợ bảo lưu toàn bộ giá trị đặt phòng để chuyển sang một thời điểm lưu trú khác phù hợp, hoặc được hoàn trả tiền phòng sau khi trừ đi các chi phí thực tế tối thiểu đã phát sinh mà không thể thu hồi.",
          ],
        },
      ],
    },
  ],
};

export default async function ServiceRefundPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LegalDocument doc={DOC} currentHref="/service-refund-policy" />;
}
