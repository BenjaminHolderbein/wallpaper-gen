import { useState, useRef, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  text: string
  children: React.ReactNode
}

export default function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const ref = useRef<HTMLSpanElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (!visible || !ref.current || !tipRef.current) return
    const trigger = ref.current.getBoundingClientRect()
    const tip = tipRef.current.getBoundingClientRect()
    const above = trigger.top > tip.height + 8
    setStyle({
      left: trigger.left + trigger.width / 2 - tip.width / 2,
      top: above ? trigger.top - tip.height - 4 : trigger.bottom + 4,
    })
  }, [visible])

  return (
    <span
      ref={ref}
      className="inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && createPortal(
        <span
          ref={tipRef}
          className="fixed z-[9999] px-2.5 py-1.5 rounded bg-gray-800 border border-gray-700 text-xs text-gray-300 text-center leading-relaxed pointer-events-none w-max max-w-52"
          style={style}
        >
          {text}
        </span>,
        document.body,
      )}
    </span>
  )
}
