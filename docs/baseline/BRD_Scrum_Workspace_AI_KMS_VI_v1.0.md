# BUSINESS REQUIREMENTS DOCUMENT (BRD)

## Scrum Team Workspace with AI-Assisted Project Knowledge Management

**Tên tiếng Việt:** Ứng dụng cộng tác cho nhóm Scrum tích hợp quản lý tri thức dự án có AI hỗ trợ  
**Phiên bản:** 1.0 — Bản dự thảo để xác thực nghiệp vụ  
**Ngày:** 07/10/2026  
**Định hướng:** Đồ án Software Engineering; xây dựng và kiểm chứng ứng dụng tích hợp các kỹ thuật sẵn có để giải quyết vấn đề nghiệp vụ.

## 1. Tóm tắt điều hành

Dự án xây dựng một ứng dụng web cho nhóm phát triển phần mềm làm việc theo Scrum. Sản phẩm kết hợp quản lý Project, Product Backlog, Sprint và task với quản lý tài liệu, quyết định và tri thức liên quan đến công việc. AI hỗ trợ thành viên truy xuất và tổng hợp thông tin từ nguồn được phép truy cập, kèm dẫn chứng để kiểm tra.

Trọng tâm kỹ thuật là liên kết dữ liệu công việc với tri thức dự án; quản lý phiên bản và quyền truy cập; tích hợp truy xuất dữ liệu có cấu trúc và tìm kiếm tài liệu; lưu dấu vết phục vụ kiểm tra. Dự án không đặt mục tiêu phát minh thuật toán AI, huấn luyện mô hình mới hoặc chứng minh sản phẩm vượt mọi công cụ trên thị trường.

AI hỗ trợ cuộc họp, nhận diện giọng nói và tự động đề xuất cập nhật task từ transcript thuộc Future Work. Các công cụ như LM Studio hoặc Agno là lựa chọn triển khai sẽ được đánh giá ở giai đoạn thiết kế, không phải yêu cầu nghiệp vụ bắt buộc.

## 2. Bối cảnh và nhóm người dùng mục tiêu

Nhóm mục tiêu ban đầu là một nhóm phát triển phần mềm nhỏ, gồm Product Owner, Scrum Master và Developers, có cả hoạt động phát triển và kiểm thử. Nhóm sử dụng Scrum để quản lý công việc và có các nguồn tri thức như yêu cầu, API specification, hướng dẫn kỹ thuật, quyết định thiết kế và lịch sử xử lý blocker.

Ứng dụng có thể hỗ trợ nhiều project, nhưng MVP không bao gồm mô hình quản trị doanh nghiệp nhiều tầng, portfolio management hoặc điều phối nhiều Scrum team. Quy mô triển khai và tải đồng thời cụ thể sẽ được xác định trong PRD/SRS theo điều kiện đồ án.

Các mô tả về khó khăn dưới đây là giả thuyết nghiệp vụ. Chưa có dữ liệu phỏng vấn hoặc đo baseline để khẳng định tần suất và mức độ ảnh hưởng của chúng trong nhóm mục tiêu.

## 3. Pain points

| ID | Khó khăn giả định | Tình huống minh họa | Hệ quả cần xác thực |
| --- | --- | --- | --- |
| PP-01 | Tri thức phân tán và thiếu liên kết với task | Task ở board, specification ở tài liệu, lý do thay đổi ở chat | Mất thời gian tìm và ghép thông tin |
| PP-02 | Task thiếu ngữ cảnh thực hiện | Task yêu cầu đổi đăng nhập nhưng không liên kết quyết định hoặc ràng buộc | Hỏi lại, hiểu sai yêu cầu hoặc làm lại |
| PP-03 | Khó xác định nguồn còn hiệu lực | Nhiều bản specification tồn tại; task vẫn tham chiếu bản cũ | Dùng thông tin lỗi thời để phát triển hoặc kiểm thử |
| PP-04 | Tri thức phụ thuộc vào cá nhân | Chỉ người phát triển ban đầu nhớ lý do lựa chọn giải pháp | Gián đoạn khi người đó vắng mặt; onboarding chậm |
| PP-05 | Khó tái sử dụng kinh nghiệm | Blocker lặp lại nhưng không tìm được cách xử lý trước đây | Lặp lại điều tra và thảo luận |
| PP-06 | Thông tin trả lời thiếu căn cứ | Câu trả lời không chỉ rõ nguồn hoặc phiên bản | Khó kiểm chứng và áp dụng vào công việc |

## 4. Problem statement

Các nhóm phát triển phần mềm làm việc theo Scrum cần quản lý cả tiến độ công việc và tri thức phục vụ công việc đó. Khi task, tài liệu kỹ thuật và quyết định dự án được lưu ở nhiều nơi mà thiếu liên kết, quyền truy cập và quản lý phiên bản thống nhất, thành viên gặp khó khăn trong việc tìm đúng thông tin còn hiệu lực và hiểu bối cảnh của một task.

Sự đứt gãy này có thể làm tăng thời gian tìm kiếm và hỏi lại, dẫn đến hiểu sai yêu cầu, lặp lại công việc và phụ thuộc vào những thành viên nắm giữ tri thức. Nhóm cần một workspace kết nối dữ liệu Scrum với tri thức dự án và hỗ trợ truy xuất thông tin có nguồn dẫn chứng, phù hợp quyền truy cập.

Giả thuyết giá trị: việc kết nối nguồn tri thức với công việc và hỗ trợ tìm kiếm bằng ngôn ngữ tự nhiên giúp thành viên tìm, kiểm tra và tái sử dụng thông tin trong những tình huống mục tiêu. Giá trị này cần được kiểm chứng; việc chỉ tập trung dữ liệu vào cùng một giao diện chưa đủ để xác nhận giả thuyết.

## 5. Phân tích 5P’s

Tài liệu sử dụng bộ 5P’s: **Problem – People – Process – Platform – Performance** như một khung phân tích của dự án. Đây không phải tuyên bố rằng mọi môn học hoặc tổ chức dùng cùng định nghĩa 5P’s.

| P | Phân tích | Định hướng giải quyết |
| --- | --- | --- |
| Problem | Công việc và tri thức thiếu liên kết; khó tìm nguồn đúng và hiện hành | Liên kết task, Sprint, tài liệu và quyết định; truy xuất có nguồn |
| People | Thành viên cần thông tin theo trách nhiệm; người biết thông tin không luôn sẵn sàng | Truy xuất tự phục vụ theo quyền; chia sẻ trách nhiệm duy trì tri thức |
| Process | Tri thức thay đổi qua refinement, phát triển, kiểm thử và review | Có vòng đời tạo, sửa, thay thế, lưu trữ và liên kết nội dung với công việc |
| Platform | Trạng thái task và nội dung tài liệu cần cách truy xuất khác nhau | Kết hợp dữ liệu có cấu trúc với tìm kiếm văn bản/ngữ nghĩa và tổng hợp bằng LLM |
| Performance | Tính hữu ích phải được đo thay vì suy ra từ việc có AI | Đánh giá nguồn truy xuất, câu trả lời, quyền truy cập và thời gian hoàn thành nhiệm vụ |

## 6. Mục tiêu nghiệp vụ

| ID | Mục tiêu | Bằng chứng đánh giá |
| --- | --- | --- |
| BO-01 | Hỗ trợ nhóm quản lý công việc Scrum trong một workflow cơ bản | Thực hiện được luồng Project → Backlog → Sprint → Board → kết thúc Sprint |
| BO-02 | Giúp thành viên truy cập ngữ cảnh liên quan từ task hoặc tài liệu | Tìm được tài liệu, quyết định và task liên quan trong các kịch bản mẫu |
| BO-03 | Hỗ trợ tìm thông tin có thể kiểm chứng | Kết quả AI dẫn đúng đoạn nguồn và phiên bản; người dùng mở được nguồn |
| BO-04 | Giảm phụ thuộc vào sự sẵn sàng của cá nhân trong các tình huống mục tiêu | Thành viên tìm được nguồn khi người nắm thông tin không tham gia hỗ trợ |
| BO-05 | Bảo vệ tri thức theo quyền và trạng thái hiệu lực | Kiểm thử không rò rỉ nội dung trái quyền; bản lỗi thời không bị trình bày như bản hiện hành |

Không đặt trước mục tiêu giảm 40% thời gian hoặc ngưỡng tăng năng suất khi chưa có baseline. Mục tiêu số sẽ được chốt sau đánh giá thử và ghi lại trong PRD hoặc kế hoạch kiểm thử.

## 7. Stakeholders và phạm vi trách nhiệm

| Vai trò | Nhu cầu chính | Trách nhiệm trong sản phẩm |
| --- | --- | --- |
| Product Owner | Truy vết yêu cầu và ưu tiên công việc | Quản lý thứ tự Product Backlog; duy trì hoặc chỉ định người phụ trách nguồn yêu cầu |
| Scrum Master | Hiểu trở ngại và bối cảnh để hỗ trợ nhóm | Theo dõi blocker và lịch sử xử lý; hỗ trợ sử dụng workspace trong quy trình Scrum |
| Developer | Hiểu task, ràng buộc và quyết định kỹ thuật | Cập nhật công việc và duy trì tri thức kỹ thuật thuộc trách nhiệm được phân công |
| Thành viên thực hiện QA | Tìm yêu cầu và căn cứ kiểm thử | Liên kết thông tin kiểm thử với task và nguồn yêu cầu; QA có thể thuộc Developers |
| Viewer/Stakeholder | Theo dõi thông tin được chia sẻ | Xem dữ liệu trong quyền được cấp; không mặc nhiên xem mọi tài liệu dự án |
| Workspace Admin | Quản trị người dùng và cấu hình truy cập | Quản lý thành viên, quyền và thiết lập; quyền quản trị không mặc nhiên cho phép đọc mọi nội dung hạn chế |

Scrum Master không mặc nhiên là người lưu giữ, cập nhật hoặc phê duyệt toàn bộ tri thức. Trách nhiệm nội dung được phân công theo nghiệp vụ. Vai trò Scrum là trách nhiệm trong nhóm; quyền phần mềm được đặc tả riêng trong PRD/SRS.

## 8. Phạm vi sản phẩm

### 8.1. Core — Trong MVP

- Project, thành viên và quyền truy cập.
- Product Backlog với loại Story/Task/Bug, mô tả, thứ tự ưu tiên và người phụ trách.
- Sprint với thời gian, Sprint Goal, Sprint Backlog và luồng bắt đầu/kết thúc.
- Board có trạng thái cơ bản và quản lý blocker; đồng bộ thay đổi giữa các thành viên.
- Tạo/nhập tài liệu văn bản hoặc Markdown, tổ chức theo project, nhãn và người phụ trách.
- Quản lý phiên bản và trạng thái hiệu lực của tài liệu/quyết định; giữ lịch sử cần thiết.
- Liên kết thủ công giữa Task, Document, Decision và Sprint để hình thành knowledge map cơ bản.
- Tìm kiếm tri thức và hỏi đáp AI có dẫn chứng, giới hạn theo quyền người dùng.
- Truy xuất trạng thái công việc hiện tại từ dữ liệu nghiệp vụ.
- Audit log cho các thay đổi chính và dấu vết nguồn phục vụ kiểm tra kết quả AI.
- Fallback: nhóm vẫn quản lý công việc, đọc và tìm tài liệu khi LLM không sẵn sàng.

Định dạng nhập phức tạp sẽ được lựa chọn trong PRD; OCR không phải điều kiện hoàn thành MVP.

### 8.2. Enhanced — Sau khi Core hoàn thành

- Nhập PDF có lớp văn bản và thêm các định dạng tài liệu.
- Burndown/Velocity cấp nhóm và báo cáo Sprint cơ bản.
- Giao diện trực quan knowledge map; gợi ý liên kết để người dùng xác nhận.
- Tích hợp repository/issue tracker ngoài và tìm kiếm kết hợp nâng cao.
- Mở rộng khả năng triển khai local LLM nếu cấu hình mục tiêu đáp ứng chất lượng và độ trễ.

### 8.3. Future Work / Ngoài MVP

- AI hỗ trợ cuộc họp: STT, tóm tắt, trích xuất action items và đề xuất cập nhật task từ transcript.
- Phòng họp audio/video, live transcription và speaker identification.
- AI Story Point Estimator, dự báo Sprint hoặc tự động phân công công việc.
- Tự động xây knowledge graph, nhiều agent chuyên biệt và xử lý tác động thay đổi phức tạp.
- Fine-tuning, huấn luyện mô hình mới, OCR diện rộng và hỗ trợ enterprise nhiều nhóm.
- Thanh toán, xây CI/CD runner hoặc hosting code repository.

## 9. Yêu cầu nghiệp vụ cấp cao

| ID | Yêu cầu | Ưu tiên | Liên kết |
| --- | --- | --- | --- |
| BR-01 | Nhóm phải quản lý được project, thành viên và quyền truy cập | Must | BO-01, BO-05 |
| BR-02 | PO phải quản lý được nội dung và thứ tự Product Backlog; nhóm quản lý Sprint Goal và công việc Sprint | Must | BO-01 |
| BR-03 | Thành viên có quyền phải cập nhật được trạng thái, người phụ trách và blocker; thay đổi được chia sẻ với nhóm | Must | BO-01 |
| BR-04 | Nhóm phải lưu và tổ chức được tài liệu, quyết định cùng người phụ trách nội dung | Must | PP-01, PP-04 |
| BR-05 | Nhóm phải phân biệt được phiên bản và nội dung hiện hành, bị thay thế hoặc lưu trữ | Must | PP-03, BO-05 |
| BR-06 | Người dùng phải liên kết và truy cập được tri thức liên quan từ task, Sprint hoặc tài liệu | Must | PP-02, PP-05 |
| BR-07 | Người dùng phải tìm kiếm được nguồn được phép xem; ngôn ngữ và phạm vi hỗ trợ được công bố rõ | Must | BO-02, BO-05 |
| BR-08 | AI phải hỗ trợ trả lời từ nguồn được phép truy cập, kèm nguồn/phiên bản; nêu thiếu bằng chứng hoặc mâu thuẫn khi phát hiện | Must | PP-06, BO-03 |
| BR-09 | Câu hỏi về trạng thái hiện tại phải dựa trên dữ liệu nghiệp vụ hiện tại, không suy ra chỉ từ tài liệu cũ | Must | BO-03, BO-05 |
| BR-10 | Quyền được thực thi trên tìm kiếm, ngữ cảnh gửi AI, câu trả lời, dẫn chứng và truy cập log | Must | BO-05 |
| BR-11 | Thay đổi công việc và tri thức chính phải có lịch sử người thao tác, thời điểm và đối tượng liên quan | Must | BO-03, BO-05 |
| BR-12 | Người có quyền phải kiểm tra được nguồn và các bước truy xuất cần thiết của một câu trả lời | Must | BO-03 |
| BR-13 | Khi AI lỗi hoặc hết tài nguyên, chức năng quản lý Scrum và truy cập tài liệu phải tiếp tục sử dụng được | Must | BO-01, BO-02 |
| BR-14 | Nhóm phải có cơ chế lưu trữ/xóa nội dung và loại bỏ nội dung không còn được phép truy xuất | Must | BO-05 |
| BR-15 | Nhóm có thể theo dõi báo cáo Sprint cơ bản từ dữ liệu công việc | Should | BO-01 |

## 10. Business rules

1. AI trong MVP hỗ trợ đọc và trả lời; không tự sửa task, ưu tiên Backlog, assignee hoặc tài liệu.
2. Trạng thái task và Sprint hiện tại có nguồn chuẩn là dữ liệu nghiệp vụ của ứng dụng. Tài liệu lịch sử có thể giải thích quá khứ nhưng không thay thế trạng thái hiện tại.
3. Quyền truy cập phải được kiểm tra trước khi đưa nội dung vào ngữ cảnh AI. Việc lọc câu trả lời ở bước cuối không thay thế kiểm soát truy xuất.
4. Khi người dùng xem lịch sử, phiên bản cũ được ghi nhãn rõ. Nếu nguồn có mâu thuẫn chưa giải quyết, hệ thống không mặc nhiên coi nguồn mới nhất là chân lý cho mọi nội dung.
5. Mỗi dẫn chứng phải gắn với nguồn và phiên bản đã dùng. Mở nguồn không được vô tình chuyển sang phiên bản khác mà không thông báo.
6. Việc sửa, thay thế, xóa hoặc thu hồi quyền phải được phản ánh trong tìm kiếm và bộ nhớ đệm theo chính sách được đặc tả. Nội dung không còn quyền xem không được tiếp tục dùng để trả lời.
7. Audit log và trace có thể chứa dữ liệu nhạy cảm; được giới hạn quyền và thời gian lưu. Không thu thập hoặc coi suy nghĩ nội bộ của mô hình là bằng chứng nghiệp vụ.
8. Story Points là ước lượng của nhóm nếu nhóm sử dụng; không dùng làm thước đo năng suất cá nhân hoặc quy đổi mặc định thành giờ.
9. Chuyển trạng thái hoàn thành tuân thủ workflow và quy tắc hoàn thành của nhóm. Scrum Master không mặc nhiên phê duyệt mọi thay đổi.
10. Các quan hệ trong knowledge map MVP do người dùng tạo hoặc xác nhận; quan hệ chưa được xác nhận không được trình bày như sự thật chắc chắn.

## 11. Kịch bản nghiệp vụ đại diện

| ID | Kịch bản | Kết quả mong đợi |
| --- | --- | --- |
| SC-01 | Thành viên mở task đăng nhập | Xem được specification, quyết định và thông tin liên quan trong quyền |
| SC-02 | Hỏi “Vì sao nhóm chọn JWT?” | Trả lời dựa trên quyết định đã lưu, kèm đoạn nguồn và phiên bản |
| SC-03 | Hỏi “Task nào đang blocked?” | Liệt kê từ trạng thái hiện tại, kèm liên kết task |
| SC-04 | Hỏi “Blocker này từng được xử lý ra sao?” | Tìm lịch sử và nguồn liên quan; không khẳng định đã giải quyết nếu chỉ có kế hoạch |
| SC-05 | Tài liệu API có bản mới thay thế bản cũ | Truy xuất hiện hành dùng bản phù hợp; xem lịch sử vẫn phân biệt được các bản |
| SC-06 | Người dùng không có quyền xem nguồn | Không tiết lộ nội dung hạn chế hoặc metadata không được phép xem |
| SC-07 | Hỏi về quyết định chưa từng được ghi lại | Thông báo chưa đủ thông tin, không tự dựng lý do |
| SC-08 | LLM không hoạt động | Người dùng vẫn thao tác board và tìm/đọc tài liệu qua chức năng fallback |

## 12. Ràng buộc, giả định và định hướng kỹ thuật

### 12.1. Ràng buộc

- Phạm vi phù hợp nguồn lực và thời gian đồ án; ưu tiên hoàn chỉnh một luồng nghiệp vụ trước các tích hợp mở rộng.
- Có thể sử dụng thư viện, mô hình và nền tảng sẵn có. Chất lượng kỹ thuật được thể hiện qua thiết kế, tích hợp, kiểm soát lỗi và kiểm chứng.
- Chi phí AI, phần cứng và thời gian xử lý phải phù hợp cấu hình triển khai mục tiêu.
- Chỉ sử dụng dữ liệu thử nghiệm có quyền sử dụng; ưu tiên dữ liệu tổng hợp hoặc đã được cho phép.
- Không tuyên bố bảo mật tuyệt đối, không hallucination hoặc Zero Data Retention nếu chưa có căn cứ cấu hình/chính sách cụ thể.

### 12.2. Giả định cần xác thực

- Nhóm có tài liệu hoặc sẵn sàng ghi lại một phần tri thức quan trọng.
- Có thể phân công người phụ trách duy trì tài liệu và quyết định.
- Có tình huống mà tìm nguồn trực tiếp hữu ích hơn hoặc bổ trợ cho hỏi đồng nghiệp.
- Nhóm chấp nhận sử dụng workflow Scrum cơ bản thay vì cấu hình tùy biến sâu.

### 12.3. Định hướng kỹ thuật, chưa phải quyết định kiến trúc

Dữ liệu Project/Sprint/Task được quản lý có cấu trúc; tài liệu và các quan hệ có danh tính, phiên bản và quyền. Tìm kiếm ngữ nghĩa/vector database hỗ trợ tìm nội dung liên quan; tra cứu định danh và trạng thái công việc sử dụng dữ liệu nghiệp vụ. LLM tổng hợp từ ngữ cảnh đã kiểm soát.

LM Studio có thể được xem xét để phục vụ mô hình local; Agno có thể được xem xét để điều phối tool và hỗ trợ tracing. Hai lựa chọn không loại trừ nhau, nhưng cũng không bắt buộc dùng cả hai. Công cụ cuối cùng được quyết định qua thử nghiệm phù hợp với nguồn lực.

Lựa chọn modular monolith hay microservices được chốt trong tài liệu kiến trúc. Nếu dùng microservices, cần giải thích ranh giới nghiệp vụ và xử lý tính nhất quán, lỗi và quan sát hệ thống; số lượng service không phải tiêu chí thành công nghiệp vụ.

## 13. Kế hoạch đánh giá và tiêu chí nghiệm thu

Đồ án đánh giá hệ thống tích hợp, không bắt buộc benchmark nghiên cứu ML hoặc so sánh nhiều model. Tracing phục vụ chẩn đoán luồng chạy; đánh giá phục vụ xác định độ đúng và tính hữu ích. Một trace đầy đủ không tự chứng minh kết quả đúng.

### 13.1. Bộ đánh giá ban đầu

Chuẩn bị khoảng 20–30 câu hỏi từ một project mẫu, gồm tìm tài liệu, tìm quyết định, trạng thái hiện tại, phiên bản cũ, thiếu thông tin và truy cập trái quyền. Mỗi câu có nguồn/phiên bản chuẩn hoặc xác định rằng không có đủ nguồn, quyền của người hỏi và tiêu chí chấm. Quy mô này phục vụ đánh giá ban đầu, không đại diện mọi Scrum team.

| Hạng mục | Cách đo | Cách sử dụng kết quả |
| --- | --- | --- |
| Retrieval | Tỷ lệ câu có ít nhất một nguồn chuẩn trong top 5; ghi rõ câu cần nhiều nguồn | Kiểm tra khả năng tìm nguồn và phân tích các trường hợp bỏ sót |
| Chất lượng câu trả lời | Tỷ lệ câu đạt tiêu chí nội dung; kiểm tra các khẳng định quan trọng có nguồn hỗ trợ | Đánh giá thủ công theo rubric; LLM judge chỉ bổ trợ nếu dùng |
| Dẫn chứng | Tỷ lệ dẫn chứng mở đúng nguồn/phiên bản và hỗ trợ khẳng định liên quan | Phân biệt “có link” với “link chứng minh được câu trả lời” |
| Phiên bản và thiếu thông tin | Tỷ lệ xử lý đúng các ca bản cũ, mâu thuẫn và không có nguồn | Xác định giới hạn hệ thống và các lỗi cần sửa |
| Phân quyền | Các ca tìm kiếm, trả lời, dẫn chứng và log trái quyền | Không chấp nhận rò rỉ trong bộ kiểm thử; không suy ra bảo mật tuyệt đối từ kết quả này |
| Thời gian xử lý | Trung vị và p95 trong cấu hình, dữ liệu và tải được công bố | Chốt NFR thực tế trong PRD/SRS, không hứa độ trễ tùy ý |
| Giá trị tìm kiếm | So sánh semantic/hybrid search với tìm từ khóa trên cùng bộ câu hỏi nếu tuyên bố cải thiện retrieval | Kiểm tra lợi ích của kỹ thuật được chọn |

### 13.2. Baseline người dùng có điều kiện

Nếu báo cáo tuyên bố giảm thời gian tìm thông tin, thực hiện một đánh giá nhỏ với nhiệm vụ tương đương giữa quy trình thủ công và ứng dụng. Đo thời gian người tìm, thời gian người hỗ trợ, tỷ lệ tìm đúng nguồn và khả năng thực hiện khi người biết thông tin không sẵn sàng. Tránh dùng lại câu hỏi đã học thuộc hoặc chỉ đo lợi thế của một giao diện quen thuộc.

Hỏi đồng nghiệp có thể nhanh hơn ở một số tình huống. Nếu chưa có cải thiện, cần giới hạn tuyên bố giá trị hoặc điều chỉnh sản phẩm; không diễn giải số liệu theo hướng mặc định AI tốt hơn.

### 13.3. Điều kiện hoàn thành Core

- Hoàn thành các yêu cầu Must và các kịch bản Core với kiểm thử chức năng phù hợp.
- Nguồn và phiên bản được truy cập/hiển thị nhất quán; không có lỗi trái quyền còn mở trong bộ kiểm thử.
- Luồng quản lý công việc vẫn dùng được khi AI thất bại.
- Có kết quả đánh giá retrieval/câu trả lời, cấu hình chạy, lỗi quan sát được và giới hạn rõ ràng.
- Các ngưỡng chất lượng AI được chốt trước đánh giá cuối trong PRD/kế hoạch kiểm thử, sau pilot; không chọn ngưỡng sau khi thấy kết quả.

## 14. Rủi ro và phương án xử lý

| Rủi ro | Tác động | Phương án |
| --- | --- | --- |
| Phạm vi Scrum + KMS + AI quá rộng | Core không hoàn chỉnh | Giữ workflow cơ bản; chuyển meeting AI và dự báo sang Future Work |
| Tài liệu thiếu hoặc lỗi thời | AI không có căn cứ đáng tin | Chủ sở hữu nội dung, phiên bản, trạng thái hiệu lực và thông báo thiếu nguồn |
| Retrieval lấy sai đoạn | Câu trả lời sai dù LLM diễn đạt tốt | Kiểm thử nguồn chuẩn, điều chỉnh chunking/retrieval, giữ tra cứu định danh |
| LLM bịa hoặc tài liệu chứa chỉ dẫn độc hại | Kết quả không đáng tin hoặc vượt phạm vi | Nội dung nguồn là dữ liệu không phải lệnh; tool đọc có quyền hẹp; kiểm tra đầu ra và không cấp quyền ghi cho AI MVP |
| Chỉ mục/cache còn dữ liệu đã thu hồi | Rò rỉ hoặc dùng bản cũ | Kiểm tra quyền hiện tại, cập nhật/xóa chỉ mục và kiểm thử thu hồi quyền |
| Local model không đạt chất lượng/độ trễ | Trải nghiệm kém | Pilot trên cấu hình mục tiêu; giữ fallback và cân nhắc provider khác nếu được phép |
| Log hoặc cloud làm lộ dữ liệu | Ảnh hưởng quyền riêng tư | Chính sách dữ liệu cho embeddings/LLM/log; tối thiểu hóa và giới hạn quyền; không mặc định masking loại bỏ mọi bí mật |
| Thành viên không duy trì tri thức | Kho nhanh chóng mất giá trị | Liên kết từ task, quy định người phụ trách và giảm thao tác ghi nhận |

## 15. Ma trận truy vết định hướng

| Pain point | Mục tiêu | Yêu cầu | Kiểm chứng |
| --- | --- | --- | --- |
| PP-01, PP-02 | BO-02 | BR-04, BR-06, BR-07 | SC-01; truy xuất nguồn liên quan |
| PP-03 | BO-05 | BR-05, BR-09, BR-14 | SC-03, SC-05; kiểm thử phiên bản |
| PP-04 | BO-04 | BR-04, BR-07, BR-08 | SC-02; tình huống không có người hỗ trợ |
| PP-05 | BO-02 | BR-06, BR-07 | SC-04; tìm lịch sử blocker |
| PP-06 | BO-03 | BR-08, BR-11, BR-12 | SC-02, SC-07; kiểm tra dẫn chứng |
| Bảo vệ truy cập | BO-05 | BR-01, BR-10, BR-14 | SC-06; kiểm thử thu hồi quyền |
| Liên tục nghiệp vụ | BO-01, BO-02 | BR-13 | SC-08; mô phỏng lỗi AI |

## 16. Deliverables và quyết định còn mở

**Deliverables:** BRD; PRD/SRS và user stories/acceptance criteria; thiết kế kiến trúc và dữ liệu; ứng dụng chạy được; bộ dữ liệu/kịch bản đánh giá; kết quả kiểm thử; hướng dẫn triển khai và báo cáo giới hạn/Future Work.

**Cần chốt ở bước tiếp theo:** nhóm pilot; định dạng tài liệu; mô hình quyền cụ thể; cấu hình triển khai và AI provider; chính sách lưu/xóa; mục tiêu độ trễ và ngưỡng chất lượng sau pilot; thiết kế kiến trúc; lịch phát triển dựa trên thời gian thực tế.

BRD v1.0 ghi nhận phạm vi đã thống nhất và các giả thuyết nghiệp vụ. Không coi việc tạo tài liệu này là bằng chứng người dùng đã xác nhận nhu cầu hoặc hội đồng đã phê duyệt đề tài.
