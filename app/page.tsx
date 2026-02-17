'use client'

import { useState, useRef, useEffect } from 'react'

type IntensityLevel = 'gentle' | 'medium' | 'savage'
type Score = {
  label: string
  value: number
}

type RoastResult = {
  roast: string
  scores: Score[]
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [intensity, setIntensity] = useState<IntensityLevel>('gentle')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RoastResult | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  
  // Additional state variables for results
  const [roastText, setRoastText] = useState('');
  const [scores, setScores] = useState<{label: string, value: number}[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Loading animation state
  const [loadingText, setLoadingText] = useState('Analyzing your questionable life choices...');

  const fileInputRef = useRef<HTMLInputElement>(null)
  const roastOutputRef = useRef<HTMLDivElement>(null)

  // Loading messages
  const loadingMessages = [
    "Analyzing your questionable life choices...",
    "Scanning for hidden mess...",
    "Calculating chaos levels...",
    "Preparing the burn...",
    "Summoning the AI spirits...",
    "Generating witty insults..."
  ]

  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0])

  // Check Ollama status on mount
  useEffect(() => {
    checkOllamaStatus()
  }, [])

  // Check Ollama status and show alert if not running
  useEffect(() => {
    const checkOllamaAndAlert = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags')
        if (!response.ok) {
          alert('Please install Ollama from ollama.com to use this app.')
        }
      } catch (error) {
        alert('Please install Ollama from ollama.com to use this app.')
      }
    }
    
    checkOllamaAndAlert()
  }, [])

  // Update loading message periodically
  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setCurrentLoadingMessage(prev => {
        const currentIndex = loadingMessages.indexOf(prev)
        const nextIndex = (currentIndex + 1) % loadingMessages.length
        return loadingMessages[nextIndex]
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [isLoading])

  // Enhanced loading animation with cycling messages
  useEffect(() => {
    if (!isLoading) return;
    
    const messages = [
      "Analyzing your questionable life choices...",
      "Judging the vibe (it's not great)...",
      "Counting the empty cups...",
      "Processing the chaos...",
      "Consulting the interior design overlords...",
      "Noticing things you hoped no one would...",
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingText(messages[i]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isLoading])

  // Typewriter effect for roast output
  useEffect(() => {
    if (!result || !roastOutputRef.current) return

    const text = result.roast
    const element = roastOutputRef.current
    element.textContent = ''

    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i)
        i++
      } else {
        clearInterval(timer)
      }
    }, 18)

    return () => clearInterval(timer)
  }, [result])

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags')
      if (response.ok) {
        setOllamaStatus('online')
      } else {
        setOllamaStatus('offline')
      }
    } catch {
      setOllamaStatus('offline')
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToastMessage('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      showToastMessage('Image too large. Please select an image under 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClearImage = () => {
    setImage(null)
    setResult(null)
    setError(null)
  }

  const handleRoast = async () => {
    if (isLoading || !image) return; // Prevent double-clicks
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Sending request...');
      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: image, 
          intensity: intensity 
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to roast');
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      // Debug: Check if image exists
      console.log('Image base64 exists:', !!image, 'Length:', image?.length);
      
      // Set new state variables
      setRoastText(data.roast);
      setScores(data.scores);
      setShowResults(true);
      
      // Also set the existing result state for backward compatibility
      setResult(data);
      
    } catch (err) {
      console.error('Frontend error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopyRoast = async () => {
    if (!result) return

    try {
      await navigator.clipboard.writeText(result.roast)
      showToastMessage('Roast copied to clipboard!')
    } catch (err) {
      console.error('Copy error:', err)
    }
  }

  const handleShare = () => {
    if (!result) return

    const text = encodeURIComponent(`My room got roasted: "${result.roast}"`)
    const url = 'https://twitter.com/intent/tweet?text=' + text
    window.open(url, '_blank')
  }

  const handleRoastAgain = () => {
    setResult(null)
    setImage(null)
    setError(null)
  }

  const showToastMessage = (message: string) => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const getIntensityEmoji = (level: IntensityLevel) => {
    switch (level) {
      case 'gentle': return '😏'
      case 'medium': return '🔥'
      case 'savage': return '💀'
    }
  }

  const getIntensityLabel = (level: IntensityLevel) => {
    switch (level) {
      case 'gentle': return 'Gentle'
      case 'medium': return 'Medium'
      case 'savage': return 'Savage'
    }
  }

  return (
    <div className="wrapper">
      {/* Header */}
      <div className="header">
        <div className="flame-row">🔥🔥🔥</div>
        <h1 className="gradient-text">ROAST<br/>MY ROOM</h1>
        <p className="sub">AI judges your living situation</p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        {/* Drop Zone */}
        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="drop-icon">📸</span>
          <h2>Drop your room photo</h2>
          <p>Or <span>click to upload</span> — we won't judge... <em>the AI will</em></p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Image Preview */}
        {image && (
          <div className="preview-box">
            <img src={image} alt="Room preview" />
            <button className="clear-btn" onClick={handleClearImage}>✕</button>
          </div>
        )}

        {/* Intensity Selector */}
        <div className="intensity-section">
          <label>Roast Intensity</label>
          <div className="intensity-btns">
            {(['gentle', 'medium', 'savage'] as IntensityLevel[]).map((level) => (
              <button
                key={level}
                className={`intensity-btn ${intensity === level ? 'active' : ''}`}
                onClick={() => setIntensity(level)}
              >
                <span className="emoji">{getIntensityEmoji(level)}</span>
                {getIntensityLabel(level)}
              </button>
            ))}
          </div>
        </div>

        {/* Roast Button */}
        <button
          className={`roast-btn ${!image || isLoading ? 'disabled' : ''}`}
          onClick={handleRoast}
          disabled={!image || isLoading}
          style={{opacity: isLoading ? 0.7 : 1}}
        >
          {isLoading ? '🔥 Roasting in Progress...' : '🔥 ROAST IT'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="error-msg">
            {error}
          </div>
        )}

        {/* Enhanced Loading Animation */}
        {isLoading && (
          <div style={{
            textAlign: 'center',
            padding: '40px 0',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{
              fontSize: '48px',
              animation: 'burnUp 0.6s ease-in-out infinite alternate'
            }}>
              🔥
            </div>
            <p style={{
              color: '#666',
              fontSize: '14px',
              marginTop: '16px',
              fontStyle: 'italic'
            }}>
              {loadingText}
            </p>
            <div style={{
              width: '200px',
              height: '4px',
              background: '#333',
              borderRadius: '2px',
              margin: '20px auto 0',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #FF3D00, #FFD600)',
                transform: 'translateX(-100%)',
                animation: 'loadingBar 2s ease-in-out infinite'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {roastText && (
        <div style={{width: '100%', maxWidth: '560px', marginTop: '40px', border: '2px solid red'}}>
          {/* DEBUG: If you see red border, code is working */}
          
          {/* Image */}
          <div style={{marginBottom: '20px', borderRadius: '16px', overflow: 'hidden'}}>
            <img src={image || ''} alt="Room" style={{width: '100%', maxHeight: '300px', objectFit: 'cover'}} />
          </div>
          
          {/* Roast */}
          <div style={{background: '#2E2E2E', padding: '24px', borderRadius: '16px'}}>
            <div style={{color: '#FF3D00', fontSize: '12px', marginBottom: '12px'}}>🔥 YOUR ROAST</div>
            <div style={{color: 'white', fontSize: '16px', lineHeight: 1.6}}>{roastText}</div>
            
            {/* Scores */}
            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
              {scores.map((s, i) => (
                <div key={i} style={{flex: 1, textAlign: 'center', background: '#1A1A1A', padding: '12px', borderRadius: '8px'}}>
                  <div style={{fontSize: '10px', color: '#666'}}>{s.label}</div>
                  <div style={{fontSize: '24px', color: '#FF3D00'}}>{s.value}/10</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="footer">
        Made with 🔥 · Powered by Claude AI
      </div>

      {/* Toast */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        Toast message here
      </div>
    </div>
  )
}
