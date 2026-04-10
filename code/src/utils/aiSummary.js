// ─── AI Summary Generator ────────────────────────────────────
export const generateAISummary = (inquiry) => {
  if (!inquiry.messages || inquiry.messages.length === 0) return "대화 내용 없음";
  const lastMsg = inquiry.messages[inquiry.messages.length - 1];
  const firstMsg = inquiry.messages[0];
  const msgCount = inquiry.messages.length;
  const customerMsgs = inquiry.messages.filter(m => m.sender === "customer");
  const operatorMsgs = inquiry.messages.filter(m => m.sender === "operator");

  if (inquiry.status === "RESOLVED") {
    if (operatorMsgs.length > 0) {
      const lastOp = operatorMsgs[operatorMsgs.length - 1].content;
      const truncated = lastOp.length > 30 ? lastOp.slice(0, 30) + "..." : lastOp;
      return `[해결] ${truncated} (${msgCount}건 대화)`;
    }
    return `[해결] 고객 문의 처리 완료 (${msgCount}건 대화)`;
  }

  if (msgCount === 1) {
    const truncated = firstMsg.content.length > 35 ? firstMsg.content.slice(0, 35) + "..." : firstMsg.content;
    return `[대기중] 고객: "${truncated}"`;
  }

  if (lastMsg.sender === "customer") {
    const truncated = lastMsg.content.length > 30 ? lastMsg.content.slice(0, 30) + "..." : lastMsg.content;
    return `[고객 응답 대기] "${truncated}" (${msgCount}건)`;
  }

  if (lastMsg.sender === "operator") {
    const truncated = lastMsg.content.length > 30 ? lastMsg.content.slice(0, 30) + "..." : lastMsg.content;
    return `[상담사 응답 완료] "${truncated}" (${msgCount}건)`;
  }

  return `진행 중 대화 ${msgCount}건`;
};
