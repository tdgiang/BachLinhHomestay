import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  LegalDocument,
  type LegalDocumentData,
} from "@/components/marketing/LegalDocument";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Chính sách bảo mật thông tin cá nhân",
  description:
    "Chính sách bảo mật thông tin cá nhân áp dụng trên website thương mại điện tử bachlinh.com.vn — thu thập, sử dụng, lưu trữ, bảo vệ dữ liệu và quyền của khách hàng.",
};

type Props = { params: Promise<{ locale: string }> };

const DOC: LegalDocumentData = {
  title: "Chính sách bảo mật thông tin cá nhân",
  scope: "Áp dụng trên website thương mại điện tử bachlinh.com.vn",
  bases: [
    "Căn cứ Luật Giao dịch điện tử số 20/2023/QH15 ngày 22/06/2023;",
    "Căn cứ Luật An toàn thông tin mạng số 86/2015/QH13 ngày 19/11/2015;",
    "Căn cứ Luật Bảo vệ quyền lợi người tiêu dùng số 19/2023/QH15 ngày 20/06/2023;",
    "Căn cứ Nghị định số 13/2023/NĐ-CP ngày 17/04/2023 của Chính phủ về bảo vệ dữ liệu cá nhân;",
    "Căn cứ Nghị định số 52/2013/NĐ-CP và Nghị định số 85/2021/NĐ-CP của Chính phủ về thương mại điện tử;",
    "Căn cứ Giấy chứng nhận ĐKDN số 0111484606 do Sở Kế hoạch và Đầu tư TP. Hà Nội cấp.",
  ],
  preamble: [
    "CÔNG TY CỔ PHẦN SẢN XUẤT THƯƠNG MẠI DỊCH VỤ BÁCH LINH (sau đây gọi tắt là 'Bách Linh' hoặc 'Chúng tôi') cam kết bảo mật tuyệt đối dữ liệu và thông tin cá nhân của Quý khách hàng khi truy cập và giao dịch trên website thương mại điện tử bachlinh.com.vn.",
    "Chính sách bảo mật này mô tả chi tiết mục đích, phạm vi thu thập, phương thức sử dụng, thời hạn lưu trữ, cơ chế bảo vệ và quyền của khách hàng đối với thông tin cá nhân của mình theo đúng quy định tại Điều 68 đến Điều 73 Nghị định số 52/2013/NĐ-CP (được sửa đổi, bổ sung bởi Nghị định số 85/2021/NĐ-CP) và Nghị định số 13/2023/NĐ-CP của Chính phủ.",
  ],
  articles: [
    {
      id: "cach-thu-thap",
      title: "Điều 1. Cách thức Bách Linh thu thập thông tin",
      blocks: [
        "Thông tin cá nhân của Quý khách trên website bachlinh.com.vn được thu thập thông qua các phương thức sau:",
        {
          items: [
            "Đăng ký tài khoản hoặc đăng nhập: Khi Quý khách tạo lập tài khoản thành viên trên hệ thống website.",
            "Điền biểu mẫu đặt phòng: Khi Quý khách nhập thông tin để thực hiện lệnh đặt phòng dịch vụ lưu trú homestay.",
            "Liên hệ hỗ trợ: Khi Quý khách gọi điện thoại, gửi email, nhắn tin hoặc gửi biểu mẫu yêu cầu tư vấn, giải quyết khiếu nại tới Bách Linh.",
            "Đăng ký nhận tin: Khi Quý khách tự nguyện đăng ký nhận thông tin khuyến mãi, ưu đãi qua email hoặc tin nhắn.",
            "Tự động qua máy chủ và Cookies: Hệ thống máy chủ tự động ghi chép các dữ liệu kỹ thuật về truy cập gồm địa chỉ IP, loại trình duyệt, hệ điều hành nhằm phục vụ công tác an ninh và tối ưu hóa trải nghiệm.",
          ],
        },
      ],
    },
    {
      id: "pham-vi-du-lieu",
      title: "Điều 2. Phạm vi các dữ liệu được thu thập",
      blocks: [
        "Các loại dữ liệu cá nhân Bách Linh có thể thu thập bao gồm:",
        {
          items: [
            "Thông tin định danh và liên hệ: Họ và tên đầy đủ, số điện thoại liên lạc, địa chỉ email, địa chỉ cư trú/liên lạc.",
            "Thông tin đặt dịch vụ homestay: Ngày nhận phòng (check-in), ngày trả phòng (check-out), loại phòng, số lượng khách (người lớn, trẻ em), các yêu cầu dịch vụ đặc biệt (nếu có).",
            "Thông tin thanh toán: Phương thức thanh toán được lựa chọn. Trường hợp thanh toán qua thẻ quốc tế hoặc ví điện tử, thông tin thẻ/tài khoản do các tổ chức trung gian thanh toán bảo mật xử lý, Bách Linh không trực tiếp lưu trữ mã bảo mật CVC/CVV.",
            "Quý khách không nhất thiết phải tạo tài khoản để xem thông tin dịch vụ. Tuy nhiên, khi thực hiện đặt phòng, việc cung cấp các thông tin cá nhân nêu trên là bắt buộc để Bách Linh hoàn tất giao dịch và phục vụ đón tiếp theo quy định cư trú.",
          ],
        },
      ],
    },
    {
      id: "muc-dich",
      title: "Điều 3. Mục đích và phạm vi sử dụng thông tin",
      blocks: [
        "Bách Linh chỉ thu thập và sử dụng thông tin cá nhân của Quý khách cho các mục đích hợp pháp sau đây:",
        {
          items: [
            "Thực hiện giao dịch đặt phòng homestay và cung cấp dịch vụ lưu trú theo yêu cầu của Quý khách.",
            "Xác nhận đơn đặt phòng, gửi mã đặt phòng và thông báo tình trạng thanh toán qua Email, SMS.",
            "Liên hệ đón tiếp, bàn giao phòng và hướng dẫn nhận phòng tại cơ sở lưu trú.",
            "Hỗ trợ khách hàng, giải đáp thắc mắc và giải quyết kịp thời các phản ánh, khiếu nại phát sinh.",
            "Cung cấp các thông tin khuyến mãi, chương trình ưu đãi tri ân khách hàng (chỉ thực hiện khi có sự đồng ý của khách hàng).",
            "Thống kê, khảo sát ý kiến khách hàng nhằm nâng cao chất lượng dịch vụ và tính năng công nghệ của website.",
            "Ngăn ngừa các hành vi gian lận, phá hoại an ninh hệ thống mạng hoặc giả mạo tài khoản người dùng.",
            "Thực hiện nghĩa vụ báo cáo, lưu trữ theo quy định của pháp luật thuế, kế toán và quản lý cư trú.",
          ],
        },
      ],
    },
    {
      id: "chia-se",
      title:
        "Điều 4. Tổ chức, cá nhân được tiếp cận thông tin cá nhân (Chia sẻ cho bên thứ ba)",
      blocks: [
        "Bách Linh cam kết bảo mật thông tin khách hàng, tuyệt đối KHÔNG bán, chia sẻ hoặc tiết lộ thông tin cho bên thứ ba vì mục đích thương mại trái phép. Dữ liệu chỉ được tiếp cận hoặc cung cấp cho các đối tượng sau:",
        {
          items: [
            "Chủ cơ sở homestay (Host) / Quản lý cơ sở: Tiếp nhận họ tên, số điện thoại, thời gian lưu trú và số lượng khách nhằm mục đích trực tiếp chuẩn bị phòng, làm thủ tục check-in và đón tiếp khách lưu trú tại chỗ.",
            "Đối tác cổng thanh toán / Ngân hàng: Tiếp nhận thông tin giao dịch cần thiết để đối soát, xác thực lệnh thanh toán trực tuyến bảo đảm tính chính xác và an toàn.",
            "Cơ quan nhà nước có thẩm quyền: Bách Linh có nghĩa vụ cung cấp dữ liệu cá nhân của khách hàng khi có yêu cầu bằng văn bản chính thức từ Cơ quan Công an, Viện kiểm sát, Tòa án hoặc cơ quan quản lý nhà nước có thẩm quyền theo quy định của pháp luật Việt Nam.",
          ],
        },
      ],
    },
    {
      id: "lien-lac",
      title: "Điều 5. Phương thức liên lạc giữa Bách Linh và khách hàng",
      blocks: [
        "Bách Linh liên lạc với Quý khách thông qua các kênh chính thức gồm: Email, tin nhắn SMS, gọi điện thoại hoặc trao đổi trực tiếp để:",
        {
          items: [
            "Thông báo tình trạng xử lý đơn đặt phòng, gửi mã xác nhận và hướng dẫn check-in.",
            "Hướng dẫn hoàn tất thanh toán hoặc thông báo kết quả đối soát hoàn tiền.",
            "Thăm dò chất lượng dịch vụ, tiếp thu ý kiến đóng góp sau kỳ nghỉ.",
            "Gửi bản tin chương trình khuyến mãi (Quý khách có toàn quyền hủy đăng ký nhận tin bất kỳ lúc nào).",
          ],
        },
      ],
    },
    {
      id: "quyen-khach-hang",
      title: "Điều 6. Quyền của Quý khách đối với dữ liệu cá nhân",
      blocks: [
        "Căn cứ Nghị định số 13/2023/NĐ-CP và pháp luật bảo vệ quyền lợi người tiêu dùng, Quý khách có đầy đủ các quyền sau:",
        {
          items: [
            "Quyền được biết và đồng ý: Được thông báo rõ ràng về hoạt động xử lý dữ liệu cá nhân và có quyền thể hiện sự đồng ý hoặc từ chối.",
            "Quyền kiểm tra, chỉnh sửa: Tự kiểm tra, cập nhật thông tin cá nhân qua tài khoản trên website hoặc yêu cầu Bách Linh hỗ trợ chỉnh sửa qua email/hotline.",
            "Quyền xóa, hủy bỏ dữ liệu: Yêu cầu Bách Linh xóa bỏ vĩnh viễn thông tin cá nhân của mình khi không còn nhu cầu sử dụng dịch vụ.",
            "Quyền từ chối quảng cáo: Từ chối nhận bản tin, tin nhắn tiếp thị quảng cáo bằng cách bấm nút hủy đăng ký ở cuối email hoặc thông báo cho Bách Linh.",
            "Bách Linh cam kết tiếp nhận và thực hiện các yêu cầu điều chỉnh, xóa dữ liệu hợp lệ trong vòng 07 ngày làm việc kể từ khi nhận được yêu cầu.",
          ],
        },
      ],
    },
    {
      id: "thoi-gian-luu-tru",
      title: "Điều 7. Thời gian lưu trữ dữ liệu cá nhân",
      blocks: [
        "7.1. Dữ liệu cá nhân của khách hàng được lưu trữ an toàn trong suốt thời gian khách hàng duy trì tài khoản hoặc sử dụng dịch vụ tại bachlinh.com.vn.",
        "7.2. Khi khách hàng gửi yêu cầu xóa bỏ thông tin, Bách Linh sẽ tiến hành xóa dữ liệu trong vòng 30 ngày kể từ ngày nhận được yêu cầu, ngoại trừ các dữ liệu chứng từ giao dịch, hóa đơn kế toán, nghĩa vụ thuế bắt buộc phải lưu trữ theo luật định trong thời hạn quy định (5 đến 10 năm).",
      ],
    },
    {
      id: "an-toan",
      title: "Điều 8. Biện pháp kỹ thuật và an toàn bảo mật dữ liệu",
      blocks: [
        "8.1. Toàn bộ thông tin truyền tải giữa trình duyệt của khách hàng và hệ thống máy chủ của Bách Linh đều được mã hóa bằng chứng chỉ bảo mật SSL (Secure Socket Layer) 256-bit tiêu chuẩn quốc tế.",
        "8.2. Dữ liệu được lưu trữ trên hệ thống máy chủ đặt tại trung tâm dữ liệu bảo đảm tiêu chuẩn an toàn thông tin, có hệ thống tường lửa (Firewall) và các giải pháp phòng chống xâm nhập trái phép.",
        "8.3. Chỉ những nhân sự được phân công nhiệm vụ và có thẩm quyền mới được cấp quyền truy cập dữ liệu khách hàng theo nguyên tắc bảo mật tối cao.",
        "8.4. Trường hợp máy chủ dữ liệu bị tin tặc tấn công dẫn đến rủi ro rò rỉ dữ liệu cá nhân, Bách Linh có trách nhiệm thông báo ngay cho cơ quan chức năng chuyên trách (Cục An ninh mạng và phòng, chống tội phạm sử dụng công nghệ cao - Bộ Công an) để xử lý trong vòng 72 giờ và thông báo kịp thời cho khách hàng.",
      ],
    },
    {
      id: "don-vi-quan-ly",
      title: "Điều 9. Thông tin đơn vị thu thập và quản lý thông tin",
      blocks: [
        "CÔNG TY CỔ PHẦN SẢN XUẤT THƯƠNG MẠI DỊCH VỤ BÁCH LINH",
        {
          items: [
            "Mã số doanh nghiệp / Mã số thuế: 0111484606",
            "Địa chỉ trụ sở chính: Số 66, Ngõ 61 Phạm Tuấn Tài, Phường Nghĩa Đô, Thành phố Hà Nội, Việt Nam",
            `Điện thoại hotline: ${COMPANY.hotline}`,
            `Hộp thư điện tử (Email): ${COMPANY.email}`,
            "Đại diện theo pháp luật: Bà NGUYỄN LAN PHƯƠNG - Giám đốc.",
          ],
        },
      ],
    },
    {
      id: "hieu-luc",
      title: "Điều 10. Hiệu lực thi hành và cam kết",
      blocks: [
        "10.1. Chính sách bảo mật này có hiệu lực chính thức kể từ ngày ký và được đăng tải công khai trên website thương mại điện tử bachlinh.com.vn.",
        "10.2. Bách Linh có quyền sửa đổi, bổ sung Chính sách này để phù hợp với quy định mới của pháp luật và thực tiễn vận hành. Mọi sửa đổi sẽ được công bố công khai trên website và có hiệu lực ngay tại thời điểm đăng tải.",
        "10.3. Việc khách hàng tiếp tục sử dụng website bachlinh.com.vn đồng nghĩa với việc khách hàng hoàn toàn nhất trí và chấp thuận với toàn bộ nội dung của Chính sách bảo mật này.",
      ],
    },
  ],
};

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LegalDocument doc={DOC} currentHref="/privacy" />;
}
