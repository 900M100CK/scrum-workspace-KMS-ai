# Research question: advisor note and BRD section

**Prepared:** 13 October 2026
**Part A** is a short note in Vietnamese for your advisor. **Part B** is an English section to add to the BRD (suggested location: new §13.4, after the evaluation section). Part B is written for agents and reviewers, so it stays in English.

---

## Part A. Ghi chú gửi cố vấn (tiếng Việt)

**Chủ đề:** Làm rõ luận điểm đồ án: Scrum Workspace với hỏi đáp AI có phân quyền

Kính gửi thầy/cô,

Em xin làm rõ luận điểm của đồ án để thầy/cô góp ý trước khi em chốt tài liệu.

**Mối quan tâm em hiểu:** Scrum chỉ là cách quản lý dự án, nên việc gắn Scrum với tài liệu và tri thức chưa thể hiện được đóng góp học thuật.

**Câu hỏi nghiên cứu em đề xuất:**
Khi trả lời câu hỏi của một nhóm Scrum, việc kết hợp *trạng thái công việc có cấu trúc* (Sprint, backlog, blocker) với *tri thức trong tài liệu có phân quyền* có cho kết quả tốt hơn, mà vẫn không làm rò rỉ nội dung, so với chỉ truy xuất tài liệu hay không?

**Cách kiểm chứng:** em dùng cùng một bộ 25 câu hỏi, cùng dữ liệu và cùng nhà cung cấp mô hình, chạy ở ba cấu hình:
1. Chỉ truy xuất tài liệu (baseline).
2. Chỉ trạng thái Scrum.
3. Kết hợp cả hai.

Các câu hỏi được gắn nhãn trước khi chạy theo ba nhóm: cần tài liệu, cần trạng thái Scrum, cần cả hai. Em đo: độ đúng của câu trả lời, độ đúng của trích dẫn (mở đúng phiên bản, đúng đoạn), độ trễ p95, và số lỗi rò rỉ nội dung ngoài quyền.

**Tiêu chí em đặt ra trước khi chạy:**
- Cấu hình kết hợp tốt hơn baseline trên nhóm "cần cả hai" và không kém hơn trên hai nhóm còn lại.
- Không có lỗi rò rỉ nào trong mọi cấu hình.
- Nếu kết quả không đạt, em vẫn báo cáo kết quả âm. Khi đó giá trị của Scrum cho bài toán này là hạn chế, và hướng tổng quát hóa sang quản lý dự án nói chung là bước tiếp theo.

**Giới hạn em tự nhận thấy:** 25 câu hỏi và nhóm pilot nhỏ chỉ cho thấy xu hướng, chưa đủ để khẳng định hiệu quả tổng quát.

Em rất mong thầy/cô cho ý kiến: câu hỏi nghiên cứu và cách đánh giá này có giải quyết được mối quan tâm về luận điểm không, hay thầy/cô muốn em điều chỉnh hướng?

Em xin cảm ơn.

---

## Part B. BRD §13.4 Research question and comparative evaluation (English)

### 13.4.1 Research question

> Does answering Scrum team questions from **structured work-item state combined with permission-controlled document knowledge** produce better answers, with no unauthorised disclosure, than answering from **document retrieval alone**?

Scrum supplies the structured state source: Sprint membership, backlog order, blocker events (BR-09, SC-03). Without it, the question does not apply.

### 13.4.2 Hypotheses

| ID | Hypothesis | Group |
| --- | --- | --- |
| H1 | The combined configuration (C2) outperforms document-only (C0) on questions that need both sources. | `both` |
| H2 | C2 is not worse than C0 on `doc` questions or than state-only (C1) on `state` questions. | `doc`, `state` |
| H3 | No configuration discloses restricted content, metadata or existence to an unauthorised actor. | all permission fixtures |

### 13.4.3 Configurations

| ID | Name | Sources enabled |
| --- | --- | --- |
| C0 | Documents only (baseline) | Document retrieval |
| C1 | State only | Structured work-item and Sprint state |
| C2 | Combined | Both |

**Fixed across C0, C1 and C2:** same question set, same data snapshot, same AI provider and model version, same prompts and token limits, same permission pipeline (access checks, evidence revalidation, citation validation). Only the enabled sources change.

```yaml
# eval/config/configurations.yaml (example)
configurations:
  - id: C0
    sources: [document_retrieval]
  - id: C1
    sources: [work_state]
  - id: C2
    sources: [document_retrieval, work_state]
shared:
  provider: "<frozen provider id>"
  model_version: "<frozen version>"
  data_snapshot: "<hash of the fixture dataset>"
  max_output_tokens: 1000
```

### 13.4.4 Question set labelling

Each of the 20 to 30 evaluation questions (BRD §13.1) carries a label assigned **before any run**:

```yaml
# eval/questions/q-014.yaml (example)
id: Q-014
text: "Why was the export story removed from Sprint 3, and who is waiting on it?"
group: both            # doc | state | both
expected_sources:
  documents: [DOC-031@v2]
  work_state: [WI-118, BLOCKER-044]
actor: member-b
permission_expectation: allowed
```

Target distribution: roughly equal groups (for example 8 / 8 / 9 for 25 questions). Include permission fixtures where the correct behaviour is refusal or a withheld answer, and revocation cases (the evidence set changes during a run).

### 13.4.5 Metrics

| Metric | Definition |
| --- | --- |
| Retrieval hit | Expected source appears in the top 5 results. |
| Answer correctness | Matches a pre-written reference answer under a fixed rubric. |
| Citation validity | Every claim cites a source that opens the exact cited version and passage. |
| Latency | p95 end-to-end time per question. |
| Leakage defects | Count of responses that disclose restricted content, metadata or existence. Target: 0. |

Thresholds are frozen under OD-07 after the pilot run and before the formal evaluation run (BRD §13.3). Rubrics, reference answers and thresholds must be committed before any evaluation run begins.

### 13.4.6 Interpretation rules

- Report counts per group, not only totals. With 20 to 30 questions, report absolute numbers and avoid claiming statistical significance.
- If H1 does not hold, report it as a negative result. The conclusion becomes: for this question set, combining Scrum state did not improve answers over document retrieval alone.
- If H3 fails in any configuration, the release gate fails regardless of H1 and H2.
- Run each question the same number of times per configuration. If answer variation is expected, record all runs.

### 13.4.7 Limitations

- Small question set and a small pilot group show a tendency, not general effectiveness.
- Fixtures are synthetic or curated, so results may not transfer to other teams.
- One provider and model version are evaluated; results may differ for others.
- Value claims about time saved remain conditional on a measured baseline (BRD §13.2) and are not made otherwise.

### 13.4.8 Traceability

| Item | Link |
| --- | --- |
| Evaluation set and thresholds | BRD §13.1, §13.3, OD-07 |
| State source | BR-09, SC-03 |
| Permission and revocation cases | BR-01, BR-10, BR-14, Business Rules 3 and 6 |
| Citation validity | BR-08, Business Rule 5 |
