import * as React from "react"
import { cn } from "../../lib/utils"

const SidebarContext = React.createContext({})

const SidebarProvider = ({ children, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(true)
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }} {...props}>
      {children}
    </SidebarContext.Provider>
  )
}

const Sidebar = React.forwardRef(({ className, ...props }, ref) => {
  const { isOpen } = React.useContext(SidebarContext)
  return (
    <div
      ref={ref}
      className={cn(
        "fixed top-0 left-0 z-40 h-screen w-64 transform bg-gray-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

const SidebarTrigger = ({ className, ...props }) => {
  const { setIsOpen } = React.useContext(SidebarContext)
  return (
    <button
      className={cn("text-orange-500 hover:text-orange-600", className)}
      onClick={() => setIsOpen((prev) => !prev)}
      {...props}
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}

const SidebarInset = React.forwardRef(({ className, ...props }, ref) => {
  const { isOpen } = React.useContext(SidebarContext)
  return (
    <div
      ref={ref}
      className={cn(
        "min-h-screen transition-all duration-300 ease-in-out",
        isOpen ? "ml-64" : "ml-0",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-4 py-3", className)} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("h-full overflow-y-auto px-3", className)} {...props} />
))
SidebarContent.displayName = "SidebarContent"

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("space-y-1", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100/80",
      className
    )}
    {...props}
  />
))
SidebarMenuButton.displayName = "SidebarMenuButton"

export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
}
