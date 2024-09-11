'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"

export default function PenguinPigGame() {
  const [score, setScore] = useState(0)
  const [penguinPos, setPenguinPos] = useState({ x: 50, y: 50 })
  const [pigPos, setPigPos] = useState({ x: 25, y: 25 })
  const [gameSize, setGameSize] = useState({ width: 600, height: 400 })
  const [isHit, setIsHit] = useState(false)
  const gameAreaRef = useRef<HTMLDivElement>(null)

  const movePenguin = useCallback((newX: number, newY: number) => {
    setPenguinPos(prev => ({
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY))
    }))
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect()
      const touch = e.touches[0]
      const newX = ((touch.clientX - rect.left) / rect.width) * 100
      const newY = ((touch.clientY - rect.top) / rect.height) * 100
      movePenguin(newX, newY)
    }
  }, [movePenguin])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const speed = 3
    setPenguinPos(prev => {
      let newX = prev.x
      let newY = prev.y
      switch(e.key) {
        case 'ArrowUp': newY = Math.max(0, prev.y - speed); break
        case 'ArrowDown': newY = Math.min(100, prev.y + speed); break
        case 'ArrowLeft': newX = Math.max(0, prev.x - speed); break
        case 'ArrowRight': newX = Math.min(100, prev.x + speed); break
      }
      return { x: newX, y: newY }
    })
  }, [])

  const movePig = useCallback(() => {
    setPigPos(prev => {
      const speed = 1.5
      const angle = Math.random() * 2 * Math.PI
      let newX = prev.x + speed * Math.cos(angle)
      let newY = prev.y + speed * Math.sin(angle)
      newX = Math.max(0, Math.min(100, newX))
      newY = Math.max(0, Math.min(100, newY))
      return { x: newX, y: newY }
    })
  }, [])

  const resetPigPosition = useCallback(() => {
    setPigPos({
      x: Math.random() * 100,
      y: Math.random() * 100
    })
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    const gameArea = gameAreaRef.current
    if (gameArea) {
      gameArea.addEventListener('touchmove', handleTouchMove)
      gameArea.addEventListener('touchstart', handleTouchMove)
    }
    const pigInterval = setInterval(movePig, 50)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (gameArea) {
        gameArea.removeEventListener('touchmove', handleTouchMove)
        gameArea.removeEventListener('touchstart', handleTouchMove)
      }
      clearInterval(pigInterval)
    }
  }, [handleKeyDown, handleTouchMove, movePig])

  useEffect(() => {
    const dx = penguinPos.x - pigPos.x
    const dy = penguinPos.y - pigPos.y
    if (Math.sqrt(dx*dx + dy*dy) < 8) {
      setScore(prev => prev + 1)
      setIsHit(true)
      setTimeout(() => {
        setIsHit(false)
        resetPigPosition()
      }, 500)
    }
  }, [penguinPos, pigPos, resetPigPosition])

  useEffect(() => {
    const updateGameSize = () => {
      const width = Math.min(window.innerWidth - 40, 800)
      const height = Math.min(window.innerHeight - 200, 600)
      setGameSize({ width, height })
    }
    updateGameSize()
    window.addEventListener('resize', updateGameSize)
    return () => window.removeEventListener('resize', updateGameSize)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-4">
      <h1 className="text-3xl font-bold mb-4">企鹅打猪猪</h1>
      <div 
        ref={gameAreaRef}
        className="relative bg-white border-4 border-blue-500 mb-4 touch-none"
        style={{ width: `${gameSize.width}px`, height: `${gameSize.height}px` }}
      >
        <div 
          className="absolute text-4xl transition-all duration-100 ease-linear"
          style={{ left: `${penguinPos.x}%`, top: `${penguinPos.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          🐧
        </div>
        <div 
          className="absolute text-4xl transition-all duration-100 ease-linear"
          style={{ left: `${pigPos.x}%`, top: `${pigPos.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          {isHit ? '💥' : '🐷'}
        </div>
      </div>
      <p className="mt-2 text-xl font-semibold">得分: {score}</p>
      <p className="mt-2 text-sm text-center">
        使用方向键或触摸屏幕移动企鹅<br/>
        碰到猪猪得分
      </p>
    </div>
  )
}