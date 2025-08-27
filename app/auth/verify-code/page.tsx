import { Suspense } from "react";

import VerifyCodeForm from "@/components/Auth/verify-code";

function VerifyCodeContent() {
  return <VerifyCodeForm />;
}

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyCodeContent />
    </Suspense>
  );
}
