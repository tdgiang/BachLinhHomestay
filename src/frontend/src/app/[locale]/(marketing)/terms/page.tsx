import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  LegalDocument,
  type LegalDocumentData,
} from "@/components/marketing/LegalDocument";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng dịch vụ",
  description:
    "Điều khoản sử dụng dịch vụ áp dụng đối với người dùng website thương mại điện tử bachlinh.com.vn — quyền, trách nhiệm các bên, quy trình đặt phòng, thanh toán, hủy phòng và giải quyết tranh chấp.",
};

type Props = { params: Promise<{ locale: string }> };

const DOC: LegalDocumentData = {
  title: "Điều khoản sử dụng dịch vụ",
  scope:
    "Ban hành áp dụng đối với người dùng website thương mại điện tử bachlinh.com.vn",
  bases: [
    "Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;",
    "Căn cứ Luật Thương mại số 36/2005/QH11 ngày 14/06/2005;",
    "Căn cứ Luật Giao dịch điện tử số 20/2023/QH15 ngày 22/06/2023;",
    "Căn cứ Luật Bảo vệ quyền lợi người tiêu dùng số 19/2023/QH15 ngày 20/06/2023;",
    "Căn cứ Nghị định số 52/2013/NĐ-CP và Nghị định số 85/2021/NĐ-CP của Chính phủ về thương mại điện tử;",
    "Căn cứ Giấy chứng nhận ĐKDN số 0111484606 do Sở Kế hoạch và Đầu tư TP. Hà Nội cấp.",
  ],
  preamble: [
    "Chào mừng Quý khách đến với website bachlinh.com.vn - nền tảng thương mại điện tử cung cấp và giới thiệu dịch vụ lưu trú homestay thuộc sở hữu và quản lý của CÔNG TY CỔ PHẦN SẢN XUẤT THƯƠNG MẠI DỊCH VỤ BÁCH LINH.",
    "Khi truy cập, tìm kiếm thông tin hoặc thực hiện bất kỳ giao dịch đặt phòng nào trên website, Quý khách được xem là đã đọc, hiểu rõ và tự nguyện đồng ý chịu sự ràng buộc pháp lý bởi toàn bộ các điều khoản và điều kiện được quy định dưới đây.",
  ],
  articles: [
    {
      id: "chu-quan",
      title: "Điều 1. Thông tin về chủ quản nền tảng",
      blocks: [
        {
          items: [
            "Tên doanh nghiệp: CÔNG TY CỔ PHẦN SẢN XUẤT THƯƠNG MẠI DỊCH VỤ BÁCH LINH",
            "Tên giao dịch đối ngoại: BACH LINH PRODUCTION TRADING SERVICE JOINT STOCK COMPANY",
            "Mã số doanh nghiệp / Mã số thuế: 0111484606 do Sở Kế hoạch và Đầu tư TP. Hà Nội cấp",
            "Địa chỉ trụ sở chính: Số 66, Ngõ 61 Phạm Tuấn Tài, Phường Nghĩa Đô, Thành phố Hà Nội, Việt Nam",
            "Người đại diện theo pháp luật: Bà NGUYỄN LAN PHƯƠNG - Giám đốc",
            `Hotline hỗ trợ: ${COMPANY.hotline} | Email: ${COMPANY.email} | Website: bachlinh.com.vn`,
          ],
        },
      ],
    },
    {
      id: "giai-thich-tu-ngu",
      title: "Điều 2. Giải thích từ ngữ",
      blocks: [
        {
          items: [
            "'Bách Linh' hoặc 'Chúng tôi': Công ty Cổ phần Sản xuất Thương mại Dịch vụ Bách Linh.",
            "'Website': Trang thông tin điện tử thương mại điện tử tại địa chỉ https://bachlinh.com.vn.",
            "'Khách hàng' hoặc 'Người dùng': Bất kỳ cá nhân, tổ chức nào truy cập, tra cứu thông tin hoặc thực hiện đặt phòng trên website.",
            "'Dịch vụ lưu trú homestay': Dịch vụ cho thuê phòng, căn hộ hoặc biệt thự nghỉ dưỡng ngắn hạn được giới thiệu và giao dịch qua website.",
            "'Host': Chủ cơ sở hoặc người quản lý trực tiếp cơ sở homestay hợp tác cung cấp dịch vụ cùng Bách Linh.",
          ],
        },
      ],
    },
    {
      id: "quy-dinh-chung",
      title: "Điều 3. Quy định chung về sử dụng nền tảng",
      blocks: [
        "3.1. Website bachlinh.com.vn hoạt động công khai, minh bạch theo các quy định của pháp luật Việt Nam về thương mại điện tử và dịch vụ lưu trú.",
        "3.2. Mọi tài nguyên trên website (bao gồm nhưng không giới hạn: hình ảnh cơ sở lưu trú, bài viết mô tả, biểu tượng, thiết kế giao diện, logo thương hiệu) thuộc quyền sở hữu trí tuệ hợp pháp của Bách Linh. Nghiêm cấm mọi hành vi sao chép, trích xuất dữ liệu tự động (scraping) hoặc sử dụng lại dưới mọi hình thức vì mục đích thương mại khi chưa có sự đồng ý bằng văn bản của Bách Linh.",
        "3.3. Bách Linh có quyền thay đổi, bổ sung các điều khoản này theo yêu cầu quản lý và quy định của pháp luật. Bản cập nhật mới nhất sẽ được đăng tải công khai trên website.",
      ],
    },
    {
      id: "quyen-khach-hang",
      title: "Điều 4. Quyền và trách nhiệm của khách hàng",
      blocks: [
        "4.1. Quyền của khách hàng:",
        {
          items: [
            "Tự do tra cứu, xem thông tin mô tả chi tiết, hình ảnh, tiện nghi và bảng giá các cơ sở homestay trên nền tảng.",
            "Đặt phòng, nhận xác nhận giao dịch và sử dụng dịch vụ lưu trú theo đúng tiêu chuẩn đã công bố.",
            "Yêu cầu Bách Linh và cơ sở homestay hỗ trợ, hướng dẫn trong suốt quá trình trước, trong và sau thời gian lưu trú.",
            "Gửi phản ánh, yêu cầu bồi thường khi chất lượng phòng hoặc dịch vụ không đúng như cam kết thỏa thuận.",
            "Được bảo mật tuyệt đối dữ liệu cá nhân theo Chính sách bảo mật.",
          ],
        },
        "4.2. Trách nhiệm của khách hàng:",
        {
          items: [
            "Cung cấp thông tin cá nhân, thông tin liên hệ và số lượng khách trung thực, chính xác khi thực hiện đặt phòng.",
            "Thanh toán đầy đủ, đúng thời hạn theo thỏa thuận và phương thức thanh toán đã lựa chọn.",
            "Xuất trình giấy tờ tùy thân hợp pháp (CCCD/Hộ chiếu) của tất cả khách lưu trú khi làm thủ tục check-in tại homestay.",
            "Chấp hành nghiêm chỉnh nội quy lưu trú, quy định phòng cháy chữa cháy, an ninh trật tự và quy tắc ứng xử văn minh.",
            "Bồi thường thiệt hại thực tế theo giá thị trường nếu làm hư hỏng, mất mát trang thiết bị, tài sản tại cơ sở homestay.",
          ],
        },
      ],
    },
    {
      id: "quyen-bach-linh",
      title: "Điều 5. Quyền và trách nhiệm của Bách Linh",
      blocks: [
        "5.1. Quyền của Bách Linh:",
        {
          items: [
            "Yêu cầu khách hàng cung cấp thông tin trung thực và xuất trình giấy tờ tùy thân hợp lệ.",
            "Từ chối tiếp nhận hoặc hủy giao dịch đặt phòng nếu phát hiện khách hàng cung cấp thông tin gian dối, vi phạm pháp luật hoặc vi phạm quy định tại Điều khoản này.",
            "Thu các khoản phí theo bảng giá công bố và thỏa thuận dịch vụ.",
          ],
        },
        "5.2. Trách nhiệm của Bách Linh:",
        {
          items: [
            "Đảm bảo thông tin niêm yết về homestay (giá cả, hình ảnh, vị trí, tiện nghi) trung thực, rõ ràng và cập nhật liên tục.",
            "Vận hành hệ thống website ổn định, bảo mật kết nối và an toàn dữ liệu khách hàng.",
            "Gửi xác nhận đặt phòng đầy đủ qua Email và tin nhắn SMS ngay sau khi khách hoàn tất giao dịch.",
            "Làm việc chặt chẽ với cơ sở homestay để bảo đảm đón tiếp khách chu đáo, đúng thời gian và đúng phòng đã chọn.",
            "Tiếp nhận, giải quyết thỏa đáng mọi khiếu nại của khách hàng theo quy trình khiếu nại đã ban hành.",
          ],
        },
      ],
    },
    {
      id: "quy-trinh-dat-phong",
      title: "Điều 6. Quy trình giao dịch đặt phòng",
      blocks: [
        "Giao dịch đặt phòng homestay trên bachlinh.com.vn được thực hiện theo 4 bước rõ ràng:",
        {
          items: [
            "Bước 1: Chọn dịch vụ: Khách hàng tìm kiếm, chọn cơ sở homestay, loại phòng, ngày đến (check-in từ 14:00), ngày đi (check-out trước 12:00) và số lượng khách.",
            "Bước 2: Cung cấp thông tin: Khách hàng nhập thông tin liên hệ của người đặt phòng và các yêu cầu bổ sung (nếu có).",
            "Bước 3: Xác nhận & Thanh toán: Khách hàng kiểm tra lại tổng số tiền thanh toán (đã bao gồm thuế VAT), lựa chọn phương thức thanh toán thuận tiện và hoàn tất lệnh thanh toán.",
            "Bước 4: Nhận xác nhận chính thức: Hệ thống tự động phát hành Mã đặt phòng duy nhất kèm thông tin cơ sở và gửi qua Email, SMS của khách hàng. Giao dịch chính thức có hiệu lực.",
          ],
        },
      ],
    },
    {
      id: "thanh-toan",
      title: "Điều 7. Chính sách thanh toán và xuất hóa đơn",
      blocks: [
        "7.1. Bách Linh chấp nhận các kênh thanh toán an toàn: Chuyển khoản ngân hàng, thẻ quốc tế (Visa/Mastercard qua cổng thanh toán bảo mật), ví điện tử (MoMo, ZaloPay, VNPay) hoặc thanh toán tại quầy cơ sở homestay theo quy định từng gói.",
        "7.2. Đơn vị tiền tệ niêm yết và giao dịch duy nhất là Việt Nam Đồng (VNĐ).",
        "7.3. Khách hàng có nhu cầu xuất hóa đơn giá trị gia tăng (VAT) hợp lệ cần cung cấp đầy đủ thông tin pháp nhân trong vòng 24 giờ sau khi thanh toán để Bách Linh khởi tạo hóa đơn điện tử gửi về email.",
      ],
    },
    {
      id: "huy-phong",
      title: "Điều 8. Chính sách hủy phòng và hoàn tiền",
      blocks: [
        "8.1. Chính sách hủy đặt phòng và mức hoàn tiền cụ thể được chủ cơ sở homestay (Host) áp dụng và thống nhất trực tiếp với khách hàng tại thời điểm xác nhận đặt phòng.",
        `8.2. Khi phát sinh nhu cầu hủy hoặc đổi lịch trình, khách hàng cần liên hệ ngay với Host hoặc hotline Bách Linh (${COMPANY.hotline}) để được hỗ trợ giải quyết.`,
        "8.3. Tiền hoàn trả (nếu đủ điều kiện) sẽ được chuyển về tài khoản ban đầu của khách hàng trong thời hạn không quá 30 ngày kể từ ngày xác nhận hủy hợp lệ.",
        "8.4. Trường hợp khách hàng không đến nhận phòng (No-show) mà không có thông báo trước, khoản tiền đặt cọc/tiền phòng đã đóng sẽ không được hoàn lại.",
      ],
    },
    {
      id: "mien-tru",
      title: "Điều 9. Quyền miễn trừ và giới hạn trách nhiệm",
      blocks: [
        "Bách Linh được miễn trừ trách nhiệm bồi thường trong các trường hợp sau:",
        "1. Khách hàng cung cấp sai lệch thông tin cá nhân, số điện thoại hoặc email dẫn đến việc không nhận được xác nhận đặt phòng hoặc không thể làm thủ tục check-in.",
        "2. Khách hàng không đến nhận phòng (no-show) hoặc đến muộn mà không thông báo trước.",
        "3. Sự cố xảy ra tại cơ sở homestay do lỗi của cơ sở lưu trú (phòng không đúng mô tả, lỗi tiện nghi). Bách Linh có trách nhiệm làm trung gian hỗ trợ khách hàng đổi phòng hoặc bồi hoàn từ phía cơ sở, nhưng trách nhiệm bồi thường trực tiếp thuộc về chủ cơ sở lưu trú.",
        "4. Mất mát, thất lạc hoặc hư hỏng tài sản cá nhân của khách hàng trong suốt thời gian lưu trú tại homestay.",
        "5. Khách hàng có hành vi vi phạm pháp luật, vi phạm nội quy an ninh trật tự cơ sở dẫn đến bị xử lý bởi cơ quan công an hoặc bị từ chối phục vụ.",
        "6. Sự cố kỹ thuật mạng diện rộng, lỗi gián đoạn từ phía nhà mạng viễn thông hoặc ngân hàng trung gian thanh toán nằm ngoài khả năng kiểm soát của Bách Linh.",
        "7. Các trường hợp bất khả kháng theo luật định (thiên tai, lũ lụt, bão tố, dịch bệnh bùng phát dẫn đến giãn cách xã hội, quyết định cấm du lịch của cơ quan nhà nước có thẩm quyền).",
        "8. Trong mọi trường hợp có lỗi xác định từ phía Bách Linh, mức bồi thường tối đa không vượt quá tổng số phí dịch vụ mà khách hàng đã thực tế chi trả cho giao dịch bị phát sinh tranh chấp đó.",
      ],
    },
    {
      id: "khieu-nai",
      title: "Điều 10. Giải quyết khiếu nại và giải quyết tranh chấp",
      blocks: [
        `10.1. Mọi phản ánh, khiếu nại của khách hàng được tiếp nhận 24/7 qua Hotline ${COMPANY.hotline}, email ${COMPANY.email} hoặc trực tiếp tại trụ sở công ty.`,
        "10.2. Thời hạn phản hồi xác nhận tiếp nhận khiếu nại là trong vòng 24 giờ làm việc. Thời hạn giải quyết dứt điểm không quá 30 ngày (vụ việc phức tạp không quá 45 ngày).",
        "10.3. Bách Linh và khách hàng cam kết luôn ưu tiên giải quyết tranh chấp thông qua thương lượng, hòa giải trên tinh thần tôn trọng quyền lợi của nhau.",
        "10.4. Trường hợp thương lượng bất thành sau 30 ngày, một trong các bên có quyền đưa vụ việc ra Tòa án nhân dân có thẩm quyền tại Hà Nội để phán quyết theo quy định của pháp luật Việt Nam.",
      ],
    },
    {
      id: "hieu-luc",
      title: "Điều 11. Luật điều chỉnh và hiệu lực áp dụng",
      blocks: [
        "11.1. Toàn bộ Điều khoản sử dụng này được điều chỉnh và diễn giải theo hệ thống pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.",
        "11.2. Điều khoản có hiệu lực kể từ ngày ký quyết định ban hành và được cập nhật công khai tại địa chỉ: https://bachlinh.com.vn/dieu-khoan-su-dung.",
      ],
    },
  ],
};

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LegalDocument doc={DOC} currentHref="/terms" />;
}
