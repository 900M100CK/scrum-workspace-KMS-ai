# Comprehensive Specification Consistency Review

**Artifact ID:** SPEC-REVIEW-01  
**Version/date:** 0.1 Draft · 9 October 2026  
**Status:** Draft for owner review; findings require downstream stage correction. Does not constitute product or architecture approval.  
**Owning role:** Stage 9 — Consistency Reviewer ([agents/09-consistency-review.md](../../agents/09-consistency-review.md))  
**Workflow standard:** [agents/WORKFLOW.md](../../agents/WORKFLOW.md) Review Loop (§Review loop, lines 37–42)  
**Inputs:**  
- [docs/baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md](../baseline/BRD_Scrum_Workspace_AI_KMS_EN_v1.0.md) (BRD v1.0)  
- [docs/sdlc/PRD_SRS.md](PRD_SRS.md) (PRD-01 v0.4)  
- [docs/architecture.md](../architecture.md) & [docs/sdlc/SAD.md](SAD.md) (SAD-03 v0.2)  
- [docs/sdlc/use-cases.md](use-cases.md) (UC-02 v0.2)  
- [docs/sdlc/data-design.md](data-design.md) (DATA-04 v0.1) & [contracts/data-model.json](../../contracts/data-model.json)  
- [docs/sdlc/api-design.md](api-design.md) (API-05 v0.1) & OpenAPI contracts ([workspace.openapi.json](../../contracts/openapi/workspace.openapi.json), [knowledge.openapi.json](../../contracts/openapi/knowledge.openapi.json))  
- [docs/sdlc/diagrams/README.md](diagrams/README.md) & [docs/sdlc/diagrams/review.md](diagrams/review.md) (UML-07 v0.2, DGM-REVIEW-01)  
- UX specifications ([docs/ux/permission-matrix.md](../ux/permission-matrix.md), [docs/ux/personas.md](../ux/personas.md), [docs/ux/sitemap.md](../ux/sitemap.md), [docs/ux/flows/](../ux/flows/))  
- [docs/sdlc/test-plan.md](test-plan.md) (TEST-08 v0.1) & [docs/sdlc/evaluation-cases.md](evaluation-cases.md) (EVAL-01)  
- [docs/sdlc/artifact-register.md](artifact-register.md) (REG-00 v0.5)

---

## 1. Executive Summary & Audit Trace

Cuộc rà soát này kiểm tra tính nhất quán toàn diện theo chuỗi truy xuất vết (traceability chain):
$$\text{BRD (BR/SC)} \longrightarrow \text{PRD (FR/AC/NFR)} \longrightarrow \text{SAD (Arch/ADRs)} \longrightarrow \text{Use Cases (UC)} \longrightarrow \text{Diagrams (DGM)} \longrightarrow \text{Data/API/Test}$$

### Kết quả tổng quan:
1. **Traceability từ BRD sang PRD và Use Cases (BR-01–BR-15; SC-01–SC-08):** **ĐẠT (Pass)**. Toàn bộ 69 FR, 69 AC, 14 Must BRs, 1 Should BR (BR-15) và 8 kịch bản đại diện (SC-01–SC-08) đều được ánh xạ đầy đủ, không có yêu cầu nào bị bỏ sót trong PRD và Use Cases v0.2.
2. **Hệ thống Kiểm tra Cấu trúc Context (Node context harness):** **ĐẠT (Pass)**. 9/9 unit tests chạy thành công; các ràng buộc metadata, release scope (61 Must, 3 Should, 1 Won't, 4 Could) và 56 operation IDs đều khớp với specs.
3. **Mô hình kiến trúc tối thiểu (Minimal Microservices Boundary):** **ĐẠT (Pass)**. Đúng 2 dịch vụ nghiệp vụ độc lập: `services/workspace` (Auth, Scrum, Permission Authority, Gateway) và `services/knowledge` (Knowledge Storage, Retrieval, LLM Synthesis, Provenance). Không có runtime cross-database joins/writes.
4. **Các điểm không nhất quán và lệch pha giữa các tài liệu:** Đã phát hiện **12 vấn đề** cần điều phối xử lý theo quy trình `WORKFLOW.md`, phân bổ thành 3 cấp độ:
   - **Blocking (3 vấn đề):** Mâu thuẫn trực tiếp giữa tài liệu thiết kế UX/Diagrams với chính sách bảo mật/phiên bản cốt lõi của PRD, SAD và Use Cases.
   - **Important (5 vấn đề):** Lệch pha về schema/endpoint giữa sơ đồ UI với OpenAPI contracts; xung đột layout Draw.io; thiếu liên kết version giữa các tài liệu header.
   - **Minor (4 vấn đề):** Tồn đọng tệp dư thừa; nhầm lẫn giữa điểm số persona mẫu và dữ liệu đo lường thực tế.

---

## 2. Bảng tổng hợp các phát hiện (Findings Matrix)

| ID | Mức độ | Lĩnh vực | Vị trí xung đột (Source location) | Nội dung không nhất quán / Xung đột | BR/SC/FR ảnh hưởng | Vai trò chịu trách nhiệm sửa (Correction Owner) |
|---|---|---|---|---|---|---|
| **F-01** | **Blocking** | Security / Delivery | [`docs/sdlc/diagrams/flowchart/ai-qa-flow.mmd`](diagrams/flowchart/ai-qa-flow.mmd#L17-L29), [`docs/ux/flows/ai-qa-flow.md`](../ux/flows/ai-qa-flow.md) vs [`docs/architecture.md`](../architecture.md#key-flows) & [`docs/sdlc/use-cases.md`](use-cases.md#uc-09) | **Phát streaming và JWT trái với cơ chế bảo vệ giao hàng (Handoff Guard & Withholding):** Flow AI hiển thị user gửi JWT session và server stream câu trả lời trực tiếp. Trong khi PRD (FR-28, FR-29, AC-29), SAD §Concurrency và UC-09 quy định rõ: Phiên là opaque session; câu trả lời phải được đệm (buffered); bắt buộc kiểm tra lại toàn bộ quyền đối với tập bằng chứng (evidence set) ngay trước khi gửi ra ngoài. Nếu có bất kỳ nguồn nào bị thu hồi trước khi phát, toàn bộ bản nháp ban đầu phải bị giữ lại (withheld), không được phép streaming từng phần ra client. | BR-01, BR-08, BR-10, BR-14; SC-02, SC-06; FR-28, FR-29 | **Stage 6 (UI/UX)** phối hợp với **Stage 3 (SAD)** & **Stage 5 (API)** |
| **F-02** | **Blocking** | Data / Lifecycle | [`docs/sdlc/diagrams/flowchart/docs-flow.mmd`](diagrams/flowchart/docs-flow.mmd#L14-L16), [`docs/ux/flows/docs-flow.md`](../ux/flows/docs-flow.md) vs [`docs/sdlc/PRD_SRS.md`](PRD_SRS.md#42-document-permissions-knowledge-and-validity) & [`docs/sdlc/data-design.md`](data-design.md#state-and-query-rules) | **Tạo tài liệu mới lưu thành Draft trái với quy định khởi tạo Current:** Sơ đồ docs-flow ghi "Save as Draft" tạo `Draft (v1.0)` và cho phép autosave đè lên Draft cũ mà không tăng version. Trong khi PRD FR-10/AC-10, DATA-04 và UC-06 quy định: Tài liệu mới tạo ra luôn có phiên bản ban đầu là **Current** (kèm phân loại bắt buộc). Trạng thái **Draft** chỉ xuất hiện khi sửa đổi (revision) một tài liệu đã có (FR-11), và mỗi revision là bất biến (immutable), không thể bị autosave đè làm mất định danh. | BR-04, BR-05, BR-14; SC-05; FR-10, FR-11 | **Stage 6 (UI/UX)** phối hợp với **Stage 4 (Data)** |
| **F-03** | **Blocking** | Access Control | [`docs/sdlc/diagrams/flowchart/permission-read-flow.mmd`](diagrams/flowchart/permission-read-flow.mmd#L14), [`docs/ux/permission-matrix.md`](../ux/permission-matrix.md#L76) vs [`docs/sdlc/PRD_SRS.md`](PRD_SRS.md#2-actors-capabilities-and-terms) & [`docs/adr/0001-protected-resource-read-policy.md`](../adr/0001-protected-resource-read-policy.md) | **Phân loại Public/Internal/Restricted và phân quyền theo Role tĩnh:** Ma trận UX và sơ đồ quyền chia tài liệu thành 3 mức: `Public / Internal / Restricted`, đồng thời gán quyền theo vai trò Scrum tĩnh (PO, SM, DEV). Điều này xung đột nghiêm trọng với PRD §2, DATA-04 (`CapabilityGrant`), OpenAPI và ADR-0001: Hệ thống chỉ có 2 phân loại chính thức là **`project_shared`** và **`restricted`**. Quyền hạn được cấp theo capability độc lập (manage-access, content-write), không vai trò Scrum nào (kể cả Admin hay SM) tự động có quyền đọc tài liệu restricted. | BR-01, BR-10, BR-14; SC-06; FR-03, FR-04, FR-50 | **Stage 6 (UI/UX)** phối hợp với **Stage 1 (PRD)** |
| **F-04** | **Important** | API Contracts | [`docs/sdlc/diagrams/flowchart/`](diagrams/flowchart/) & [`docs/ux/flows/`](../ux/flows/) vs [`contracts/openapi/`](../../contracts/openapi/) | **Đường dẫn API trên sơ đồ UX là bản phác thảo không khớp với OpenAPI:** Sơ đồ UX dùng các endpoint giả định như `POST /api/v1/ai/query`, `POST /api/v1/documents/:id/publish`, `PATCH /api/v1/tasks/:id/status`, `POST /api/v1/tasks/:id/blocker`. Trong khi hợp đồng chính thức trong `workspace.openapi.json` và `knowledge.openapi.json` định nghĩa chuẩn RESTful RPC: `POST /knowledge/questions`, `POST /knowledge/documents/{document_id}/versions/{version_id}/publish`, `POST /tasks/{task_id}/state`, `POST /tasks/{task_id}/blockers`, `PUT /tasks/{task_id}/assignee`. | BR-02, BR-03, BR-05, BR-08; FR-09, FR-44, FR-45, FR-53 | **Stage 5 (API)** phối hợp với **Stage 6 (UI/UX)** |
| **F-05** | **Important** | Diagram Layout | [`docs/sdlc/diagrams/architecture/service-composition.drawio`](diagrams/architecture/service-composition.drawio) | **Va chạm hình học giữa ô Database (WD) và Khung tiêu đề:** Cell `WD` (Workspace Database) bị thiếu tọa độ y (mặc định về 0) với chiều rộng 350, chiều cao 150 tại x=1460, giao cắt đè lên `diagram-title` (y=20..120, x=80..2310). Khi chạy công cụ `validate.py --strict`, sơ đồ bị cảnh báo lỗi `W-OVERLAP` và trừ điểm (score 5). | BR-01–BR-14 (Cấu trúc kiến trúc) | **Stage 7 (UML / Diagram Author)** |
| **F-06** | **Important** | Artifact Trace / Version | [`docs/architecture.md`](../architecture.md#L6) | **Header của Architecture trỏ phiên bản cũ của Use Cases:** Dòng 6 của `docs/architecture.md` ghi inputs là `[use cases](sdlc/use-cases.md) v0.1`. Tuy nhiên, tệp use-cases.md đã được nâng cấp toàn diện lên `v0.2 Draft · 9 October 2026` với các luồng kịch bản và trigger cụ thể. | Toàn bộ quy trình truy xuất vết Stage 2 $\to$ 3 | **Stage 3 (Architect)** |
| **F-07** | **Important** | Data Contract | [`docs/sdlc/data-design.md`](data-design.md#L18) vs [`contracts/data-model.json`](../../contracts/data-model.json) | **Khóa logic của ReadGrant thiếu trường trạng thái/thu hồi:** DATA-04 ghi khóa logic là `document_id + user_id + grant_generation`. Tuy nhiên, để đáp ứng yêu cầu FR-39/FR-52 (khi xóa thành viên dự án thì toàn bộ grant bị thu hồi ngay lập tức và khi add lại không được tự động phục hồi), bảng ReadGrant cần có trạng thái tường minh (`revoked_at` hoặc trạng thái hiệu lực gắn với membership session) để tránh truy vấn nhầm grant cũ. | BR-10, BR-14; SC-06; FR-39, FR-52 | **Stage 4 (Data Designer)** |
| **F-08** | **Important** | Test & Verification | [`docs/sdlc/test-plan.md`](test-plan.md#L22) vs [`docs/sdlc/use-cases.md`](use-cases.md#uc-09) | **Chưa ánh xạ tường minh các mã lỗi ngoại lệ (EX-*) từ Use Cases vào Test Plan:** Tệp use-cases.md v0.2 đã chuẩn hóa các exception flows cụ thể (`EX-01` đến `EX-05` trong UC-09, `EX-01` đến `EX-03` trong UC-12, `EX-01` đến `EX-03` trong UC-05). Tuy nhiên, `test-plan.md` v0.1 mới chỉ liệt kê các test case tổng quát (TC-01 đến TC-12) mà chưa có bảng ma trận đối chiếu (trace matrix) 1-1 giữa từng mã `EX-*` và mã kịch bản kiểm thử tương ứng. | NFR-02, NFR-03; SC-01–SC-08 | **Stage 8 (Test Plan Author)** |
| **F-09** | **Minor** | File Organization | [`docs/sdlc/diagrams/use-case-diagram.drawio`](diagrams/use-case-diagram.drawio) vs [`docs/sdlc/diagrams/use-case/use-case-diagram.drawio`](diagrams/use-case/use-case-diagram.drawio) | **Tồn tại 2 bản sao tệp sơ đồ Use Case:** Tệp sơ đồ use-case tồn tại song song ở cả thư mục gốc `diagrams/` và thư mục phân loại `diagrams/use-case/`. Cần loại bỏ bản sao ở thư mục gốc để tuân thủ quy tắc tổ chức folder-per-type được ghi trong `diagrams/README.md`. | Quy ước tổ chức Stage 7 | **Stage 7 (Diagram Author)** |
| **F-10** | **Minor** | Environment / Tooling | [`docs/sdlc/diagrams/review.md`](diagrams/review.md#L21) | **Công cụ dòng lệnh Draw.io desktop bị lỗi phân quyền Windows AppContainer:** Binary `draw.io.exe` cài tại máy tính người dùng gặp lỗi ACL Sandbox của Electron (`install_dir_access.cc:52`), dẫn đến không thể xuất tự động tệp PNG/SVG headless qua lệnh CLI. Các kiểm tra hiện tại buộc phải dựa vào linter cấu trúc tĩnh Python (`validate.py`). | Quá trình xuất ảnh kiểm tra trực quan | **Môi trường máy trạm (Workstation Owner)** |
| **F-11** | **Minor** | Evaluation Evidence | [`docs/ux/personas.md`](../ux/personas.md#L28-L94) | **Điểm hài lòng trong User Journey chỉ là minh họa, chưa có đo lường thực nghiệm:** Các bảng biểu diễn sự hài lòng (+2, -1) trong tệp personas và user-journey mang tính chất kịch bản thiết kế giả định, chưa được ghi chú rõ ràng là giả định nhằm tránh hiểu nhầm thành dữ liệu đo lường đánh giá người dùng thực tế. | BRD §13.2; NFR-07, NFR-09 | **Stage 6 (UI/UX)** & **Stage 8 (Evaluator)** |
| **F-12** | **Minor** | Terminology | [`docs/sdlc/use-cases.md`](use-cases.md#uc-04) vs [`docs/sdlc/PRD_SRS.md`](PRD_SRS.md#41-authentication-membership-and-work) | **Thuật ngữ trạng thái Task:** Sơ đồ `board-flow.mmd` có cột `In Review`, trong khi PRD §4.1 (FR-09), DATA-04 và Use Cases chỉ định nghĩa 3 trạng thái bảng cơ bản của Core MVP: `To Do` $\to$ `In Progress` $\to$ `Done`. Cột `In Review` thuộc nhóm tùy biến mở rộng, cần ghi chú rõ ràng là quy ước giao diện hoặc đưa về đúng 3 trạng thái chuẩn. | BR-03; FR-09; AC-09 | **Stage 6 (UI/UX)** |

---

## 3. Đánh giá tính toàn vẹn của chuỗi Truy vết (Traceability Analysis)

### 3.1. Truy vết từ Yêu cầu nghiệp vụ (BR) $\to$ Ca sử dụng (UC) $\to$ Thiết kế & Kiểm thử
Dưới đây là ma trận kiểm chứng liên kết 2 chiều giữa 14 Yêu cầu Cốt lõi (Core Must BRs) và các thực thể kỹ thuật:

```
[BR-01: Auth & Membership] ───> FR-01..04, 36..39 ───> UC-01, UC-02 ───> SAD §3, ADR-0001,0006 ───> TC-01, TC-02, TC-03
[BR-02: Backlog & Sprint]   ───> FR-05..08, 40..42 ───> UC-03, UC-05 ───> SAD §2, Workspace Svc    ───> TC-07
[BR-03: Board State & Block]───> FR-09, 43, 44     ───> UC-04         ───> SAD §4, Op Events        ───> TC-07, TC-08
[BR-04: Knowledge Creation] ───> FR-10, 62, 65     ───> UC-06         ───> SAD §2, Knowledge Svc    ───> TC-02
[BR-05: Immutable Versions] ───> FR-11, 12, 19, 45 ───> UC-07         ───> SAD §5, Version Model    ───> TC-05
[BR-06: Explicit Links]     ───> FR-16, 17, 49     ───> UC-08         ───> SAD §2, Link Table       ───> TC-02
[BR-07: Retrieval Current]  ───> FR-18, 20, 53, 63 ───> UC-08, UC-09 ───> SAD §4, Knowledge Index   ───> TC-05, TC-12
[BR-08: Cited Evidence AI]  ───> FR-21..24, 28, 60 ───> UC-09         ───> SAD §4, ADR-0005,0006    ───> TC-04, TC-09
[BR-09: Current State Q&A]  ───> FR-25, 26         ───> UC-10         ───> SAD §4, Operational API  ───> TC-08
[BR-10: Scoped Disclosure]  ───> FR-14, 29, 55, 59 ───> UC-01,06,09,13───> SAD §3, ADR-0001 (404)   ───> TC-02, TC-03, TC-04
[BR-11: Business Audit]     ───> FR-31, 56         ───> UC-11, UC-13 ───> SAD §2, Audit Catalogue   ───> TC-11
[BR-12: Provenance & Trace] ───> FR-27, 32, 57, 58 ───> UC-11, UC-13 ───> SAD §2, Run Records      ───> TC-11
[BR-13: AI Outage Fallback] ───> FR-33, 34, 69     ───> UC-12         ───> SAD §3, Fallback Paths   ───> TC-10
[BR-14: Lifecycle & Retain] ───> FR-13, 39, 48, 52 ───> UC-02,06,07   ───> SAD §5, Tombstone/Revoke ───> TC-03, TC-06
```

**Nhận xét:** Chuỗi liên kết nghiệp vụ từ BRD qua PRD tới Use Cases hoàn toàn thông suốt. Không phát hiện yêu cầu mồ côi (orphan requirement) nào trong tài liệu giải pháp.

### 3.2. Truy vết 8 Kịch bản Cốt lõi (Representative Journeys SC-01–SC-08)
- **SC-01 (Task & Linked Docs without leak):** Được định nghĩa tại PRD §3, đặc tả qua UC-03 & UC-08, bảo đảm qua mã lỗi FR-59 trong OpenAPI và xác minh bởi TC-02.
- **SC-02 (Ask why JWT, verify exact version):** Đặc tả qua UC-09, bảo đảm qua cơ chế kiểm tra trích dẫn FR-60 và xác minh bởi TC-09.
- **SC-03 (Current blocker operational answer):** Đặc tả qua UC-10, tách bạch giữa sự kiện vận hành mới nhất và tài liệu lịch sử, xác minh bởi TC-08.
- **SC-04 (Prior blocker resolution history):** Đặc tả qua UC-04 & UC-08, truy vết sự kiện BlockerEvent có thứ tự thời gian.
- **SC-05 (Replace version, label Superseded):** Đặc tả qua UC-07, bảo đảm tính bất biến của bản ghi lịch sử, xác minh bởi TC-05.
- **SC-06 (Revoke membership, repeat retrieval/delivery):** Kịch bản kiểm thử bảo mật trọng yếu, được bảo đảm bằng cơ chế Handoff Guard (ADR-0006) trong SAD, kiểm tra qua UC-02, UC-06, UC-09 và xác minh bởi TC-03 & TC-04.
- **SC-07 (Unrecorded decision $\to$ Insufficient evidence):** Đặc tả qua UC-09 (Alt-3a), cấm AI tự ý suy diễn hoặc bịa đặt lý do khi thiếu dữ liệu nguồn, xác minh bởi TC-09.
- **SC-08 (AI Outage fallback):** Đặc tả qua UC-12, bảo đảm các chức năng Scrum, đọc tài liệu và tìm kiếm từ khóa hoạt động 100% độc lập khi AI sập, xác minh bởi TC-10.

---

## 4. Kế hoạch điều phối khắc phục (Coordination & Action Plan)

Theo quy định tại **`agents/WORKFLOW.md` (§Review loop, lines 37–42)**:
> *"Coordinator routes each Stage 9 finding to the earliest affected stage: requirement $\to$ Stage 1; actor/flow $\to$ 2; boundary/decision $\to$ 3; data $\to$ 4; contract $\to$ 5; UX state $\to$ 6; diagram $\to$ 7; verification $\to$ 8."*

Điều phối viên tiến hành phân công các gói công việc cụ thể cho từng vai trò sở hữu tài liệu như sau:

```
                  ┌────────────────────────────────────────┐
                  │ Stage 9: Consistency Review (Báo cáo)  │
                  └───────────────────┬────────────────────┘
                                      │
         ┌──────────────┬─────────────┼──────────────┬──────────────┐
         ▼              ▼             ▼              ▼              ▼
   [Stage 3: SAD] [Stage 4: Data][Stage 5: API] [Stage 6: UX]  [Stage 7: UML]
      Fix F-06       Fix F-07      Fix F-04       Fix F-01       Fix F-05
                                                  Fix F-02       Fix F-09
                                                  Fix F-03
                                                  Fix F-11, F-12
```

### 4.1. Gói nhiệm vụ cho Stage 6 — UI/UX Designer ([agents/06-ui-ux.md](../../agents/06-ui-ux.md))
- **Hành động 1 (Xử lý F-01):** Sửa đổi [`docs/ux/flows/ai-qa-flow.md`](../ux/flows/ai-qa-flow.md) và mã nguồn Mermaid [`docs/sdlc/diagrams/flowchart/ai-qa-flow.mmd`](diagrams/flowchart/ai-qa-flow.mmd):
  - Xóa bỏ việc gửi trực tiếp "JWT Session" và cơ chế "Stream Answer".
  - Thêm bước kiểm tra lại quyền truy cập trước khi đưa vào ngữ cảnh (Context Submission Guard) và bước kiểm tra lại nguồn trích dẫn trước khi bàn giao câu trả lời (Delivery Handoff Guard).
  - Thêm nhánh ngoại lệ: Khi nguồn bị thu hồi trong lúc chờ bàn giao $\to$ Toàn bộ câu trả lời bị giữ lại (`Answer Withheld - Source Revoked`), không phát streaming từng phần.
- **Hành động 2 (Xử lý F-02):** Sửa đổi [`docs/ux/flows/docs-flow.md`](../ux/flows/docs-flow.md) và [`docs/sdlc/diagrams/flowchart/docs-flow.mmd`](diagrams/flowchart/docs-flow.mmd):
  - Sửa luồng "New Document": Lưu lần đầu luôn tạo phiên bản **`Current (v1.0)`** kèm phân loại bắt buộc (`project_shared` hoặc `restricted`).
  - Tách bạch rõ ràng: `Draft` chỉ được tạo khi người dùng có quyền content-write bấm "Create Revision" từ một bản Current có sẵn.
  - Loại bỏ khái niệm "Autosave đè lên Draft mà không đổi version".
- **Hành động 3 (Xử lý F-03 & F-12):** Sửa đổi [`docs/ux/permission-matrix.md`](../ux/permission-matrix.md) và [`docs/sdlc/diagrams/flowchart/permission-read-flow.mmd`](diagrams/flowchart/permission-read-flow.mmd):
  - Thay thế hệ thống nhãn `Public / Internal / Restricted` thành 2 phân loại chuẩn: `project_shared` và `restricted`.
  - Phân định rõ quyền dựa trên Capability Grants (chứng chỉ quyền hạn) thay vì gán mặc định cho chức danh Scrum tĩnh.
  - Chuẩn hóa cột bảng trạng thái Task về 3 cột chuẩn MVP: `To Do | In Progress | Done`.

### 4.2. Gói nhiệm vụ cho Stage 7 — Diagram Author ([agents/07-uml-diagrams.md](../../agents/07-uml-diagrams.md))
- **Hành động 1 (Xử lý F-05):** Cập nhật lại tệp [`docs/sdlc/diagrams/architecture/service-composition.drawio`](diagrams/architecture/service-composition.drawio):
  - Gán tọa độ `y` hợp lệ cho cell `WD` (Workspace Database) tách biệt hoàn toàn khỏi khung tiêu đề `diagram-title` (y=20..120).
  - Chạy kiểm tra bằng script linter: `python scripts/validate.py docs/sdlc/diagrams/architecture/service-composition.drawio --strict --score` để đảm bảo đạt 0 lỗi, 0 cảnh báo, điểm score = 0.
- **Hành động 2 (Xử lý F-09):** Xóa tệp sơ đồ thừa [`docs/sdlc/diagrams/use-case-diagram.drawio`](diagrams/use-case-diagram.drawio) tại thư mục gốc, chỉ duy trì tệp chuẩn đã phân loại tại [`docs/sdlc/diagrams/use-case/use-case-diagram.drawio`](diagrams/use-case/use-case-diagram.drawio) theo đúng cấu trúc thư mục quy định.

### 4.3. Gói nhiệm vụ cho Stage 3, Stage 4, Stage 5 & Stage 8
- **Stage 3 (Architect):** Cập nhật Header của [`docs/architecture.md`](../architecture.md#L6) để trỏ chính xác vào Use Cases phiên bản `v0.2 Draft` (Xử lý F-06).
- **Stage 4 (Data Designer):** Bổ sung trường ghi nhận thu hồi (`revoked_at`) hoặc trạng thái kiểm soát vòng đời vào định nghĩa logic của bảng `ReadGrant` trong [`docs/sdlc/data-design.md`](data-design.md#L18) (Xử lý F-07).
- **Stage 5 (API Designer):** Cung cấp tài liệu bảng ánh xạ (endpoint mapping table) trong [`docs/sdlc/api-design.md`](api-design.md) để Stage 6 tham chiếu đồng bộ tên các phương thức API và đường dẫn RESTful (Xử lý F-04).
- **Stage 8 (Test Plan Author):** Mở rộng [`docs/sdlc/test-plan.md`](test-plan.md) bằng cách bổ sung bảng ánh xạ từ các mã lỗi ngoại lệ `EX-01` đến `EX-05` của UC-09, UC-12, UC-05 sang các mã Test Case tương ứng (Xử lý F-08).

---

## 5. Kết luận & Trạng thái Bàn giao (Handoff Statement)

- **Đánh giá trạng thái tổng thể:** **`Needs downstream correction`** (Chưa thể phê duyệt toàn bộ bộ tài liệu cho đến khi 3 vấn đề Blocking được Stage 6/UX và Stage 7/UML giải quyết đồng bộ).
- **Độ tin cậy của tài liệu Cốt lõi (Core Specification Trust):**
  - Khung yêu cầu (BRD v1.0, PRD-01 v0.4) và Đặc tả mục tiêu ca sử dụng (UC-02 v0.2) cùng Kiến trúc tổng thể (SAD-03 v0.2) đã đạt độ nhất quán cao về mặt lý thuyết và quy tắc bảo mật.
  - Các xung đột phát hiện tập trung chủ yếu ở **tầng giao diện người dùng (UX flows, Permission matrix)** và **các sơ đồ trực quan hóa (Diagrams)** do thừa hưởng từ các bản vẽ phác thảo ban đầu trước khi chính sách bảo vệ nguồn được chốt chặt chẽ trong SAD v0.2 và UC v0.2.
- **Quy trình tiếp theo:**
  Sau khi các vai trò sở hữu hoàn tất việc sửa chữa theo chỉ dẫn chi tiết ở Mục 4, điều phối viên (Coordinator) sẽ kích hoạt chạy lại Stage 9 để xác nhận toàn bộ 12 phát hiện đã được khắc phục hoàn toàn.
