export function canChangePaymentProofStatus(
  isAdmin: boolean,
  submittedBy: unknown,
  reviewerUid: string,
) {
  return isAdmin && String(submittedBy ?? "") !== reviewerUid;
}
