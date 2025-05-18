'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const options = ['Very close', 'Nearby', 'Surroundings']

export default function Hero() {
  const [zip, setZip] = useState('')
  const [option, setOption] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const router = useRouter()

  const selectedIdx = option !== null ? options.indexOf(option) : -1

  const validateZip = (v: string) =>
    /^\d{5}(?:[-\s]?\d{4})?$/.test(v)

  const handleExplore = () => {
    if (!validateZip(zip.trim())) {
      setError('Please enter a valid ZIP code (e.g. 12345 or 12345-6789).')
      return
    }
    if (option === null) {
      setError('Please select a distance.')
      return
    }
    setError('')
    const qs = new URLSearchParams({
      zip: zip.trim(),
      option,
    })
    router.push(`/news?${qs}`)
  }

  return (
    <section id="hero" className="relative bg-gray-50 lg:pt-10">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center">
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            <span>Community News</span>
            <br />
            <span>In Seconds</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            LocalPulse is where you come to learn about the news, events, and stories happening in your community.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl lg:pr-4">
            {/* ZIP input */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter ZIP code"
                className="w-full h-12 !text-lg placeholder:text-lg"
                value={zip}
                onChange={(e) => {
                  setZip(e.target.value)
                  setError('')
                }}
              />
            </div>

            {/* Pill-style distance selector */}
            <div className="-mt-6 flex-1 flex flex-col">
              <label className="mb-2 text-base font-medium">Select Distance</label>
              <div
                className="flex w-full h-10 rounded-full overflow-hidden bg-gray-200"
                onMouseLeave={() => setHoverIdx(null)}
              >
                {options.map((o, idx) => {
                  const isHoverFill = hoverIdx !== null && idx <= hoverIdx
                  const isSelectFill = hoverIdx === null && idx <= selectedIdx

                  return (
                    <div
                      key={o}
                      className={`flex-1 flex items-center justify-center cursor-pointer transition-colors duration-200 border border-white ${
                        isHoverFill
                          ? 'bg-gray-300 text-gray-900'
                          : isSelectFill
                          ? 'bg-green-500 text-white'
                          : 'bg-transparent text-gray-700'
                      }`}
                      onClick={() => {
                        setOption(o)
                        setError('')
                      }}
                      onMouseEnter={() => setHoverIdx(idx)}
                    >
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="pr-4 pt-4 ml-[20%] mr-[20%]">
            <Button
              onClick={handleExplore}
              className="w-full h-12 text-xl bg-gradient-to-br from-green-500 to-green-700 hover:scale-[101%] hover:shadow-lg hover:cursor-pointer"
            >
              Explore
            </Button>
          </div>
          {error && <p className="mt-2 text-red-500">{error}</p>}
        </div>

        <div className="flex-1 mt-10 lg:mt-0">
          <img
            src="/neighborhood.jpg"
            alt="Community illustration"
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  )
}
