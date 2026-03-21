import { useEffect, useRef, useState } from 'react'

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

function loadGoogleMapsScript() {
  return new Promise((resolve) => {
    if (window.google?.maps?.places?.AutocompleteSuggestion) { resolve(); return }
    if (document.getElementById('google-maps-script')) {
      const interval = setInterval(() => {
        if (window.google?.maps?.places?.AutocompleteSuggestion) { clearInterval(interval); resolve() }
      }, 100)
      return
    }
    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&language=en`
    script.async = true
    script.onload = () => {
      // New Places API needs importLibrary
      window.google.maps.importLibrary('places').then(resolve)
    }
    document.head.appendChild(script)
  })
}

export default function CityAutocomplete({ onSelect, placeholder = 'Search city...', className = '' }) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)
  const sessionTokenRef = useRef(null)

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    })

    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setInputValue(val)

    if (!val.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!window.google?.maps?.places?.AutocompleteSuggestion) return
      try {
        const { suggestions: results } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: val,
          includedPrimaryTypes: ['locality'],
          includedRegionCodes: ['us'],
          sessionToken: sessionTokenRef.current,
        })
        setSuggestions(results || [])
        setShowDropdown((results || []).length > 0)
      } catch (err) {
        console.error('Autocomplete error:', err)
      }
    }, 200)
  }

  const handleSelect = async (suggestion) => {
    setShowDropdown(false)
    try {
      const place = suggestion.placePrediction.toPlace()
      await place.fetchFields({ fields: ['location', 'addressComponents'] })

      const components = place.addressComponents || []
      const city = components.find(c => c.types.includes('locality'))?.longText || ''
      const state = components.find(c => c.types.includes('administrative_area_level_1'))?.shortText || ''
      const label = city && state ? `${city}, ${state}` : suggestion.placePrediction.text.text

      const lat = place.location.lat()
      const lng = place.location.lng()

      // Refresh session token after selection
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()

      setInputValue('')
      onSelect({ label, latitude: lat, longitude: lng })
    } catch (err) {
      console.error('Place fetch error:', err)
    }
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />

      {showDropdown && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          listStyle: 'none',
          margin: 0,
          padding: '4px 0',
          zIndex: 1000,
          overflow: 'hidden',
        }}>
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(s)}
              style={{
                padding: '10px 16px',
                fontSize: '0.9rem',
                color: '#111827',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {s.placePrediction.text.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}