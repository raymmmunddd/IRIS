import { Suspense } from "react"
import VerifyPage from "./verify-client"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyPage />
    </Suspense>
  )
}
