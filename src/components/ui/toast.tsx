'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { CheckCircle, AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed right-4 top-4 z-[100] flex max-h-screen w-[calc(100%-2rem)] flex-col gap-3 md:max-w-[420px]',
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border bg-white p-4 pr-12 shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full',
  {
    variants: {
      variant: {
        default: 'default border border-slate-200 bg-white text-slate-900',
        success: 'success border-[#36C463] bg-[#F1FBF4] text-slate-900',
        warning: 'warning border-[#F3B63C] bg-[#FFF7E8] text-slate-900',
        error: 'error border-[#F35B5B] bg-[#FFF1F1] text-slate-900',
        help: 'help border-[#4A8BF7] bg-[#F1F6FF] text-slate-900',
        destructive: 'destructive border-[#F35B5B] bg-[#FFF1F1] text-slate-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 text-slate-500 shadow-sm transition-colors hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--iris-primary)]/40',
      'group-[.destructive]:text-[#E04F4F] group-[.destructive]:hover:text-[#D64646] group-[.destructive]:focus:ring-[#E04F4F]/40 group-[.destructive]:focus:ring-offset-white',
      'group-[.success]:text-[#2EAF57] group-[.success]:hover:text-[#25984A]',
      'group-[.warning]:text-[#D28B1E] group-[.warning]:hover:text-[#BF7C16]',
      'group-[.error]:text-[#E04F4F] group-[.error]:hover:text-[#D64646]',
      'group-[.help]:text-[#377DFF] group-[.help]:hover:text-[#2F6FE6]',
      className,
    )}
    toast-close=""
    {...props}
  >
    <span className="sr-only">Dismiss</span>
    <span className="relative flex h-7 w-7 items-center justify-center">
      <X className="h-3.5 w-3.5" />
      <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="9"
          pathLength="100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-20"
        />
        <circle
          cx="12"
          cy="12"
          r="9"
          pathLength="100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="toast-progress"
        />
      </svg>
    </span>
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const { style: styleProp, duration: durationProp, ...rest } = props
        const duration = typeof durationProp === 'number' ? durationProp : 5000
        const style = {
          ...styleProp,
          '--toast-duration': `${duration}ms`,
        } as React.CSSProperties
        return (
          <Toast key={id} variant={variant} duration={duration} style={style} {...rest}>
            <div className="flex w-full gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-opacity-20 pointer-events-none">
                {variant === 'success' && (
                  <div className="rounded-full bg-[#DFF6E8] p-2 text-[#2EAF57]">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                )}
                {variant === 'warning' && (
                  <div className="rounded-full bg-[#FFEFCB] p-2 text-[#D28B1E]">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                )}
                {(variant === 'destructive' || variant === 'error') && (
                  <div className="rounded-full bg-[#FFE0E0] p-2 text-[#E04F4F]">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                )}
                {variant === 'help' && (
                  <div className="rounded-full bg-[#E1ECFF] p-2 text-[#377DFF]">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                )}
                {(!variant || variant === 'default') && (
                   <div className="rounded-full bg-slate-100 p-2 text-slate-600">
                      <HelpCircle className="h-5 w-5" />
                   </div>
                )}
              </div>

              <div className="grid gap-1 py-1">
                {title && <ToastTitle className="text-slate-900">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="font-normal text-slate-600">{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  Toaster
}
