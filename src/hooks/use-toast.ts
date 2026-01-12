import * as React from "react"

type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
}

const listeners: Array<(toasts: Toast[]) => void> = []
let memoryToasts: Toast[] = []
let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

function dispatch(toasts: Toast[]) {
  memoryToasts = toasts
  listeners.forEach((listener) => {
    listener(memoryToasts)
  })
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>(memoryToasts)

  React.useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const index = listeners.indexOf(setToasts)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  const dismiss = React.useCallback((toastId?: string) => {
    if (toastId) {
      dispatch(memoryToasts.filter((t) => t.id !== toastId))
    } else {
      dispatch([])
    }
  }, [])

  const toast = React.useCallback((props: Omit<Toast, "id">) => {
    const id = genId()
    const newToast = { ...props, id }
    dispatch([...memoryToasts, newToast])
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      dismiss(id)
    }, 3000)

    return { id }
  }, [dismiss])

  return {
    toasts,
    toast,
    dismiss,
  }
}
