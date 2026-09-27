export default function ResidentTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-resident-page className="min-h-full">
      {children}
    </div>
  )
}
