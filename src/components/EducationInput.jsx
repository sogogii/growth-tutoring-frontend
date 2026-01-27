import { useState, useEffect, useRef } from 'react'
import './styles/EducationInput.css'

/**
 * EducationInput Component with Fallback
 * Uses Hipolabs API with fallback to local data if API fails
 */

// Top 100 universities as fallback when API is unavailable
const FALLBACK_UNIVERSITIES = [
  { name: "Harvard University", country: "United States" },
  { name: "Stanford University", country: "United States" },
  { name: "Massachusetts Institute of Technology", country: "United States" },
  { name: "University of California, Berkeley", country: "United States" },
  { name: "University of California, Los Angeles", country: "United States" },
  { name: "University of California, San Diego", country: "United States" },
  { name: "University of California, Irvine", country: "United States" },
  { name: "Yale University", country: "United States" },
  { name: "Princeton University", country: "United States" },
  { name: "Columbia University", country: "United States" },
  { name: "University of Chicago", country: "United States" },
  { name: "University of Pennsylvania", country: "United States" },
  { name: "Cornell University", country: "United States" },
  { name: "University of Michigan", country: "United States" },
  { name: "New York University", country: "United States" },
  { name: "Northwestern University", country: "United States" },
  { name: "Duke University", country: "United States" },
  { name: "Johns Hopkins University", country: "United States" },
  { name: "University of Oxford", country: "United Kingdom" },
  { name: "University of Cambridge", country: "United Kingdom" },
  { name: "Imperial College London", country: "United Kingdom" },
  { name: "University College London", country: "United Kingdom" },
  { name: "University of Edinburgh", country: "United Kingdom" },
  { name: "King's College London", country: "United Kingdom" },
  { name: "University of Toronto", country: "Canada" },
  { name: "University of British Columbia", country: "Canada" },
  { name: "McGill University", country: "Canada" },
  { name: "McMaster University", country: "Canada" },
  { name: "University of Sydney", country: "Australia" },
  { name: "University of Melbourne", country: "Australia" },
  { name: "Australian National University", country: "Australia" },
  { name: "University of Queensland", country: "Australia" },
  { name: "ETH Zurich", country: "Switzerland" },
  { name: "University of Zurich", country: "Switzerland" },
  { name: "Technical University of Munich", country: "Germany" },
  { name: "Ludwig Maximilian University of Munich", country: "Germany" },
  { name: "Heidelberg University", country: "Germany" },
  { name: "Humboldt University of Berlin", country: "Germany" },
  { name: "Sorbonne University", country: "France" },
  { name: "École Polytechnique", country: "France" },
  { name: "Paris Sciences et Lettres University", country: "France" },
  { name: "University of Tokyo", country: "Japan" },
  { name: "Kyoto University", country: "Japan" },
  { name: "Tokyo Institute of Technology", country: "Japan" },
  { name: "Osaka University", country: "Japan" },
  { name: "Waseda University", country: "Japan" },
  { name: "Keio University", country: "Japan" },
  { name: "Seoul National University", country: "South Korea" },
  { name: "KAIST", country: "South Korea" },
  { name: "Yonsei University", country: "South Korea" },
  { name: "Korea University", country: "South Korea" },
  { name: "Pohang University of Science and Technology", country: "South Korea" },
  { name: "National University of Singapore", country: "Singapore" },
  { name: "Nanyang Technological University", country: "Singapore" },
  { name: "Tsinghua University", country: "China" },
  { name: "Peking University", country: "China" },
  { name: "Fudan University", country: "China" },
  { name: "Shanghai Jiao Tong University", country: "China" },
  { name: "Zhejiang University", country: "China" },
  { name: "University of Hong Kong", country: "Hong Kong" },
  { name: "Chinese University of Hong Kong", country: "Hong Kong" },
  { name: "Hong Kong University of Science and Technology", country: "Hong Kong" },
  { name: "Indian Institute of Technology Bombay", country: "India" },
  { name: "Indian Institute of Technology Delhi", country: "India" },
  { name: "Indian Institute of Science", country: "India" },
  { name: "University of Amsterdam", country: "Netherlands" },
  { name: "Delft University of Technology", country: "Netherlands" },
  { name: "University of Copenhagen", country: "Denmark" },
  { name: "Lund University", country: "Sweden" },
  { name: "KTH Royal Institute of Technology", country: "Sweden" },
  { name: "Uppsala University", country: "Sweden" },
  { name: "University of Helsinki", country: "Finland" },
  { name: "University of Oslo", country: "Norway" },
  { name: "Complutense University of Madrid", country: "Spain" },
  { name: "University of Barcelona", country: "Spain" },
  { name: "Sapienza University of Rome", country: "Italy" },
  { name: "University of Bologna", country: "Italy" },
  { name: "Polytechnic University of Milan", country: "Italy" },
  { name: "University of São Paulo", country: "Brazil" },
  { name: "University of Buenos Aires", country: "Argentina" },
  { name: "National Autonomous University of Mexico", country: "Mexico" },
  { name: "University of Cape Town", country: "South Africa" },
  { name: "Tel Aviv University", country: "Israel" },
  { name: "Hebrew University of Jerusalem", country: "Israel" },
  { name: "Technion - Israel Institute of Technology", country: "Israel" },
  { name: "American University of Beirut", country: "Lebanon" },
  { name: "King Abdulaziz University", country: "Saudi Arabia" },
  { name: "King Saud University", country: "Saudi Arabia" },
  { name: "United Arab Emirates University", country: "United Arab Emirates" },
  { name: "University of Auckland", country: "New Zealand" },
  { name: "University of Otago", country: "New Zealand" },
  { name: "Chulalongkorn University", country: "Thailand" },
  { name: "University of Malaya", country: "Malaysia" },
  { name: "University of the Philippines", country: "Philippines" },
  { name: "Vietnam National University, Hanoi", country: "Vietnam" },
  { name: "University of Indonesia", country: "Indonesia" },
  { name: "Cairo University", country: "Egypt" },
  { name: "American University in Cairo", country: "Egypt" }
]

function EducationInput({ value, onChange, required = false, placeholder = "e.g., Bachelor of Science in Biology, University of California, Irvine" }) {
  const [inputValue, setInputValue] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)
  const debounceTimer = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search in fallback universities
  const searchFallback = (searchTerm) => {
    const normalized = searchTerm.toLowerCase()
    return FALLBACK_UNIVERSITIES.filter(uni => 
      uni.name.toLowerCase().includes(normalized) ||
      uni.country.toLowerCase().includes(normalized)
    ).slice(0, 10)
  }

  // Fetch from API with fallback
  const fetchUniversities = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    
    // Extract potential university name (extract last part after comma)
    const words = searchTerm.split(/[,;]/).map(w => w.trim())
    const lastPart = words[words.length - 1]
    const searchQuery = lastPart || searchTerm
    
    try {
      // Try API first
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch(
        `https://universities.hipolabs.com/search?name=${encodeURIComponent(searchQuery)}&limit=10`,
        { signal: controller.signal }
      )
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
        setShowDropdown(data.length > 0)
        setUsingFallback(false)
      } else {
        throw new Error('API not available')
      }
    } catch (error) {
      // Fallback to local search - USE searchQuery NOT searchTerm!
      console.log('Using fallback university list, searching for:', searchQuery)
      const fallbackResults = searchFallback(searchQuery)
      console.log('Fallback results:', fallbackResults.length, 'universities found')
      setSuggestions(fallbackResults)
      setShowDropdown(fallbackResults.length > 0)
      setUsingFallback(true)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchUniversities(newValue)
    }, 300)
  }

  const handleSelectSuggestion = (university) => {
    const existingParts = inputValue.split(/[,;]/).map(w => w.trim())
    
    let newValue
    if (existingParts.length > 1 && 
        (existingParts[0].toLowerCase().includes('bachelor') || 
         existingParts[0].toLowerCase().includes('master') ||
         existingParts[0].toLowerCase().includes('phd') ||
         existingParts[0].toLowerCase().includes('associate') ||
         existingParts[0].toLowerCase().includes('diploma'))) {
      newValue = `${existingParts[0]}, ${university.name}`
    } else {
      newValue = university.name
    }

    setInputValue(newValue)
    onChange(newValue)
    setSuggestions([])
    setShowDropdown(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && showDropdown && suggestions.length > 0) {
      e.preventDefault()
      handleSelectSuggestion(suggestions[0])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  return (
    <div className="education-input-wrapper" ref={dropdownRef}>
      <input
        type="text"
        className="education-input"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowDropdown(true)
          }
        }}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      
      {showDropdown && suggestions.length > 0 && (
        <div className="education-dropdown">
          {usingFallback && (
            <div className="education-dropdown-notice">
              🔍 Showing popular universities (API unavailable)
            </div>
          )}
          {suggestions.map((university, index) => (
            <div
              key={index}
              className="education-dropdown-item"
              onClick={() => handleSelectSuggestion(university)}
            >
              <div className="university-name">{university.name}</div>
              <div className="university-country">{university.country}</div>
            </div>
          ))}
        </div>
      )}
      
      <div className="education-hint">
        💡 Example: "Bachelor of Science in Biology, University of California" or just the university name
      </div>
    </div>
  )
}

export default EducationInput