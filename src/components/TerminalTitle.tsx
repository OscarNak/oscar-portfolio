'use client'

import { useState, useEffect } from 'react'

type TerminalTitleProps = {
  text: string
  speed?: number
}

export function TerminalTitle({ text, speed = 100 }: TerminalTitleProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)

  // Effet de typing
  useEffect(() => {
    let currentIndex = 0
    const intervalId = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(intervalId)
      }
    }, speed)

    return () => clearInterval(intervalId)
  }, [text, speed])

  // Effet de clignotement du curseur
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div className="font-mono bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-accent2/30">
      <div className="flex items-center gap-2">
        <span className="text-accent2">$</span>
        <span className="text-accent2">~/oscar</span>
        <span className="text-white/80">&gt;</span>
        <div className="text-white font-space tracking-widest">
          {displayedText}          
          <span 
            className={`ml-0.5 -translate-y-[-3px] inline-block w-2 h-5 bg-accent2 ${
              cursorVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transition: 'opacity 0.1s' }}
          />
        </div>
      </div>
    </div>
  )
}
