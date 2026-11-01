# SP-02 — Đối chiếu brainstorming và đề xuất đã thu gọn

Ngày: 31/10/2026
Phiên bản: 0.3 — Bản giải thích dành cho chủ project.
Trạng thái: Đề xuất đã sửa; chưa được cho phép triển khai.
File này thay bản giải thích 0.2. Nó không thay thế spec, hợp đồng API hoặc quyết định của chủ project.

## 1. Kết luận sau khi đọc nguồn thật

Phản biện giúp thu nhỏ gói P03. Tôi đã kiểm tra spec SP-02, OpenAPI Workspace v0.2.10, nơi đăng ký API, mã session/operator và migration hiện có; không chỉ dựa vào mô tả trước đó.

| Nội dung brainstorming | Kết quả đối chiếu và đề xuất sửa |
| --- | --- |
| Giữ creator + created_at | Giữ trong 007. Máy chủ ghi người/thời điểm tạo; không đoán cho dữ liệu cũ. |
| Giữ quyền tạo dự án + nhật ký riêng | Giữ trong 007. Bảng quyền hiện tại cần project đã tồn tại; nhật ký nghiệp vụ hiện tại không biểu diễn được việc cấp quyền trước khi có project. |
| Tách refactor session trước | Thêm task P03A riêng, có hồi quy SP-01 trước P03; chưa viết code. |
| Dời chống lặp sang P04 | Hợp lý: hiện buildApp chỉ đăng ký session/health, P03 dự kiến chỉ có công cụ quản trị riêng. Phải hoàn tất chống lặp trước khi bật createProject ở P04, không được để API ghi chạy trước. |
| Chỉ giữ status + ID, không body | Chưa đủ cho hợp đồng hiện tại. Đề xuất giữ snapshot tối thiểu của kết quả, không lưu toàn bộ HTTP body/header và không thêm bảng receipt chung trong 007. |
| Bỏ bảng con trỏ | Đồng ý bỏ khỏi thiết kế 007. Đề xuất token được ký, không lưu từng con trỏ trong DB; vẫn giữ phân trang và các ràng buộc của spec/hợp đồng. |
| Thêm khóa hàng Project | Đã có trong ADR-0026 v0.1; tiếp tục giữ, không phải cơ chế mới do phản biện bổ sung. |
| Thêm CHECK giới hạn revision | Đã có trong đề xuất v0.1; tiếp tục giữ cùng kiểm tra ở ứng dụng. |
| Làm rõ bootstrap đầu tiên | Đúng là bản giải thích trước chưa đủ cụ thể. Đã bổ sung quy trình cấp quyền đầu tiên qua công cụ quản trị riêng. |

Các thay đổi trên đã ghi vào [ADR-0026 v0.3](docs/adr/0026-project-membership-foundation.md) và [kế hoạch v0.4](docs/implementation/features/sp-02-project-membership/plan.md). Brainstorming là đầu vào phản biện, chưa được ghi thành sự cho phép của bạn.

## 2. Gói đang xin phép đã nhỏ lại như thế nào?

**P03A — làm trước:** tách kiểm tra session thành phần dùng được trong cùng giao dịch với nghiệp vụ; giữ hành vi SP-01 và chạy hồi quy. Không thêm migration hay endpoint.

**007/P03 — làm sau P03A:** chỉ bổ sung người/thời điểm tạo dự án, quyền tạo dự án toàn hệ thống, nhật ký cấp/thu hồi riêng, CHECK revision và công cụ quản trị/cấp quyền đầu tiên. Không có bảng receipt, bảng cursor hoặc API ghi SP-02 trong bước này.

**P04 — trước khi bật API tạo dự án:** thiết kế và kiểm chứng phần chống lặp tối thiểu trên bảng idempotency_record hiện có; chốt con trỏ được ký và phối hợp khai báo lỗi phân trang trong hợp đồng. Những phần này được dời đúng nơi sử dụng, không bị bỏ khỏi yêu cầu.

## 3. Vì sao status + ID vẫn thiếu?

Hợp đồng đang có:

- createProject thành công trả 201 với Project gồm project_id, name, description, revision.
- addMember thành công trả 201 với Member gồm project_id, user_id, role, revision.
- removeMember thành công trả 204, không có body.

Ví dụ thất bại cụ thể:

1. Thêm thành viên với role=developer, revision=1 đã commit nhưng client mất phản hồi.
2. Sau đó thành viên bị xóa rồi thêm lại với role=viewer, revision=3.
3. Client gửi lại yêu cầu cũ cùng idempotency key.
4. Nếu chỉ có ID và đọc Member hiện tại, server sẽ trả role/revision của lần thêm khác. Nếu thực hiện thêm lại thì lại sai nghiệp vụ.

Đề xuất sửa: giữ khóa chống lặp vĩnh viễn theo **actor + operation + key**, hash yêu cầu, status/ID và snapshot các trường kết quả tối thiểu nêu trên. Dùng bảng hiện có với phần mở rộng nhỏ ở P04; không lưu HTTP header/cookie hoặc body tổng quát. Kiểm tra quyền hiện tại trước khi cho xem lại kết quả. Không dựng kết quả cũ từ dữ liệu hiện tại.

Không cần byte phản hồi giống từng ký tự nếu các giá trị hợp đồng vẫn là kết quả gốc. Giao diện đọc lại trạng thái hiện tại bằng yêu cầu riêng sau khi đối chiếu kết quả thao tác.

Nếu thực sự chỉ muốn trả outcome/status/ID, phải đổi schema phản hồi và các consumer liên quan theo một thay đổi hợp đồng được ghi nhận. Phương án đó không bị cấm, nhưng không phải thay thế tương đương hợp đồng hiện tại. Giữ snapshot vẫn có chi phí lưu trữ và bảo vệ dữ liệu; chưa có tuyên bố dung lượng bị chặn hay chính sách xóa đã được chọn.

## 4. Bỏ bảng con trỏ không có nghĩa bỏ phân trang hoặc ràng buộc

Nguồn thực tế quan trọng hơn giả định danh sách sẽ ngắn:

- Spec SP-02 yêu cầu client mới có thể phân trang thành viên và kiểm tra con trỏ sai/ngoại phạm vi/cũ.
- listMembers đã mô tả con trỏ xác thực, ràng buộc người/phạm vi/quyền/tập dữ liệu; lỗi 400 và 409 đã khai báo.
- ADR-0019 còn Proposed và đề xuất thêm ràng buộc phiên. Đây chưa phải bằng chứng chủ project đã duyệt mọi cơ chế của ADR đó.
- listProjects có tham số cursor nhưng thiếu khai báo 400/409. Cần sửa phối hợp trước khi triển khai các lỗi này.

Ví dụ nếu chỉ dùng last_id: người dùng lấy trang 1, thành viên/quyền hoặc dữ liệu thay đổi, rồi dùng con trỏ cũ lấy trang 2. Mỗi request vẫn có thể lọc đúng quyền, nhưng kết quả âm thầm ghép từ hai tập khác nhau và không đáp ứng quy tắc phát hiện con trỏ cũ. Con trỏ của người khác cũng không bị nhận diện là ngoại phạm vi nếu chỉ xem vị trí cuối.

Phương án mới được đề xuất: **con trỏ ký HMAC, không có bảng DB**, ràng buộc người/route/phạm vi/quyền/tập dữ liệu/hạn dùng và kiểm tra quyền mỗi request. Không đưa session token, session ID hoặc metadata không được xem vào payload đọc được. Chữ ký không mã hóa dữ liệu; base64 không bảo mật nội dung.

Đánh đổi: cần khóa ký riêng và cách xử lý khi thiếu/đổi khóa. Con trỏ cũ có thể bị từ chối, client tải lại danh sách; không được bỏ kiểm tra quyền khi xác minh chữ ký thành công. Chi tiết và kiểm thử thuộc bước P04/P05 trước khi dùng, chưa được triển khai hoặc nghiệm thu.

Nếu muốn bỏ cả phân trang hoặc ràng buộc đã mô tả thì phải đề xuất sửa spec/hợp đồng riêng, không lấy giả định quy mô nhỏ làm bằng chứng để bỏ.

## 5. Bootstrap người có quyền tạo dự án đầu tiên

Quy trình đề xuất:

1. Người vận hành có quyền quản trị riêng dùng công cụ SP-01 hiện có để tạo hoặc xác định một account đang hoạt động.
2. Công cụ P03 cấp quyền create-project cho đúng user_id, có người thao tác/lý do/điều kiện phiên bản và nhật ký trong cùng giao dịch.
3. Sang P04, người đó đăng nhập và tạo dự án qua API. Giao dịch tạo dự án cấp membership và quyền membership-manage ban đầu.

Không tự tạo admin khi bảng rỗng, không tài khoản/mật khẩu mặc định, không endpoint bootstrap công khai, không suy quyền từ role. Đây là quy trình dùng danh tính quản trị riêng đã có trong vận hành, không phải trình duyệt tự cấp quyền.

Nếu mất phản hồi công cụ quản trị, vẫn phải kiểm tra phiên bản/quyền/nhật ký trước khi thử lại; private tool không miễn rủi ro gửi lặp. Account bị disable không được dùng bootstrap để né chính sách đó.

## 6. Những nguyên tắc nghiệp vụ giữ nguyên

- Quyền cấp tường minh; role chỉ mô tả.
- Người tạo có quyền quản lý thành viên được cấp lúc tạo, không có quyền vĩnh viễn từ danh tính.
- Xóa thành viên vô hiệu hóa quyền và bỏ phân công hiện tại trong cùng giao dịch với audit; rejoin không khôi phục.
- Không xóa hoặc thu hồi quyền của manager có hiệu lực cuối cùng qua các thao tác quản lý tương ứng; kiểm tra dưới khóa Project.
- Không sửa lịch sử, không ghi DB của service khác và không biến quyền quản trị thành quyền đọc tài liệu hạn chế.
- Migration cũ giữ nguyên. Dữ liệu cũ không thể đối chiếu thì từ chối, không đoán hoặc xóa.

## 7. Quyết định còn cần từ bạn

Chỉ khi bạn đồng ý với phương án đã thu gọn, có thể cho phép:

> Cho phép P03A tách kiểm tra session dùng chung và chạy hồi quy SP-01, sau đó migration 007/P03 theo ADR-0026 v0.3 với quyền tường minh, nhật ký, bootstrap riêng và CHECK revision. Chỉ kiểm thử trên PostgreSQL dùng một lần với dữ liệu giả lập; không nâng cấp database phát triển, không xóa dữ liệu, không commit/push. Phần chống lặp và phân trang phải được chốt và kiểm chứng trước các API P04 phụ thuộc.

Đây là mẫu câu để bạn quyết định, không phải quyết định đã được ghi nhận. Nếu muốn sửa thêm, gửi các điểm cần thay đổi; không cần duyệt từng tên cột SQL hoặc từng lần chạy kiểm tra trong phạm vi đã cho phép.

## 8. Câu hỏi phản biện tiếp với Claude

> Đề xuất đã đổi sang P03A riêng và migration 007 không có receipt/cursor table. Trước P04 sẽ mở rộng idempotency_record để giữ danh tính thao tác vĩnh viễn và snapshot tối thiểu theo schema Project/Member hiện tại; con trỏ dùng chữ ký HMAC nhưng vẫn ràng buộc người/phạm vi/quyền/tập dữ liệu/hạn dùng. Hãy kiểm tra xem đây có phải mức tối thiểu đủ giữ hợp đồng không, có trường hợp gửi lặp/thu hồi quyền/rejoin hoặc thay khóa làm hỏng kết quả không. Đặc biệt phản biện bootstrap, việc bảo toàn clock-fault khi rollback, thứ tự khóa, giới hạn revision và tiêu chí kiểm thử. Phân biệt vấn đề phải giải quyết trước P03 với vấn đề chỉ cần trước P04. Đừng coi phản biện hay passing schema tests là duyệt triển khai hoặc bằng chứng hành vi.

Nên gửi kèm ADR và spec/hợp đồng bên dưới để tránh phải đoán. Không gửi .env, password, cookie, token hay dữ liệu thật.

## 9. Nguồn kiểm tra

- [ADR-0026 — đề xuất sửa v0.3](docs/adr/0026-project-membership-foundation.md).
- [Kế hoạch SP-02](docs/implementation/features/sp-02-project-membership/plan.md).
- [Quyết định đã ghi nhận và phần còn chờ](docs/implementation/features/sp-02-project-membership/decision-batch.md).
- [Task P03A](docs/implementation/features/sp-02-project-membership/tasks/SP02-P03A-session-transaction-refactor.md), [P03](docs/implementation/features/sp-02-project-membership/tasks/SP02-P03-owned-authority-foundation.md), [P04](docs/implementation/features/sp-02-project-membership/tasks/SP02-P04-project-create-and-reads.md).
- [Spec SP-02](specs/002-project-membership.md).
- [OpenAPI Workspace v0.2.10](contracts/openapi/workspace.openapi.json): createProject, addMember, removeMember, listProjects, listMembers.
- [API registration hiện tại](services/workspace/src/app.ts), [session store](services/workspace/src/session/store.ts), [operator SP-01](services/workspace/src/session/operator.ts).

Bản cập nhật này chỉ thay đổi đề xuất/tài liệu; chưa chạy kiểm thử hành vi SP-02, migration hoặc hồi quy session. Kết quả kiểm tra tài liệu/context được ghi riêng trong kế hoạch sau khi chạy.

## Cập nhật 0.3 — bỏ ràng buộc phiên của con trỏ

Đã kiểm tra các hợp đồng có cursor, spec SP-02, ADR-0018/0019 và các phần session-related khác. Không tìm thấy tính năng phân trang nào khác đòi cùng session; token ghi tài liệu và manifest AI có ràng buộc riêng và giữ nguyên. Vì vậy đã sửa quy tắc cursor chung trong ADR-0019 v0.4 và đồng bộ ADR-0026 v0.3, không để ngoại lệ mâu thuẫn.

Con trỏ không gắn session ID trong payload hoặc chữ ký. Mỗi request vẫn phải đăng nhập hợp lệ; đăng nhập lại cùng người không tự làm con trỏ chết. Người dùng, thế hệ membership/quyền, route/bộ lọc/thứ tự, thế hệ tập dữ liệu và hạn dùng vẫn phải được kiểm tra. Phải chốt watermark cụ thể cho từng listProjects/listMembers trước P04; lượt sửa này chưa chọn counter/digest, khóa ký hoặc sửa code.
