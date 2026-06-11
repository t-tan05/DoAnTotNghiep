import { Toaster } from "sonner"
import AppRoute from "./routes/AppRoute"


function App() {
  return (
    <>
      <AppRoute />
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
