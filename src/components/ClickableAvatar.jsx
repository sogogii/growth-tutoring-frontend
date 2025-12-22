import { useRef, useState } from 'react'
import './styles/ClickableAvatar.css'

/**
 * ClickableAvatar Component
 * Click on avatar to upload profile picture
 * Immediately updates across entire app
 */
function ClickableAvatar({ currentImage, onImageChange, userName = 'User', currentUser, setCurrentUser }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  // ADD YOUR IMGBB API KEY HERE
  const IMGBB_API_KEY = '7b2a11b7098609c580b686521c4d7dec'

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

  // Default avatar with initials
  const DEFAULT_AVATAR = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=E5E7EB&color=374151&size=280`

  /**
   * Validate file
   */
  const validateFile = (file) => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Please upload a JPG, PNG, WebP, or GIF image.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image must be less than 5MB.'
    }
    return null
  }

  /**
   * Compress image
   */
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          let width = img.width
          let height = img.height
          const maxSize = 800

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            0.85
          )
        }
        img.onerror = reject
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Convert blob to base64
   */
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Upload to ImgBB
   */
  const uploadToImgBB = async (blob) => {
    if (!IMGBB_API_KEY || IMGBB_API_KEY === 'YOUR_IMGBB_API_KEY_HERE') {
      throw new Error('Please add your ImgBB API key')
    }

    const base64Image = await blobToBase64(blob)
    const formData = new FormData()
    formData.append('image', base64Image)

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to upload to ImgBB')
    }

    const data = await response.json()
    return data.data.url
  }

  /**
   * Update profile picture on backend immediately
   */
  const updateProfilePictureOnBackend = async (imageUrl) => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    
    try {
      const response = await fetch(`${API_BASE}/api/users/${currentUser.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileImageUrl: imageUrl
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile on backend')
      }

      return await response.json()
    } catch (err) {
      console.error('Backend update error:', err)
      throw err
    }
  }

  /**
   * Handle file selection
   */
  const handleFileInput = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setTimeout(() => setError(null), 5000)
      return
    }

    try {
      setUploading(true)

      // Compress
      const compressedBlob = await compressImage(file)

      // Upload to ImgBB
      const imageUrl = await uploadToImgBB(compressedBlob)

      // Update form state (for MyProfilePage)
      onImageChange(imageUrl)

      // Update backend immediately
      if (currentUser && setCurrentUser) {
        try {
          // Get the updated user data from backend
          const backendResponse = await updateProfilePictureOnBackend(imageUrl)
          
          // Merge the backend response with current user data
          const updatedUser = { 
            ...currentUser, 
            ...backendResponse,
            profileImageUrl: imageUrl  // Ensure this field is set
          }
          setCurrentUser(updatedUser)
          
          // Update localStorage
          localStorage.setItem('currentUser', JSON.stringify(updatedUser))
          
        } catch (backendError) {
          console.error('Backend update failed:', backendError)
          // Still show the image locally even if backend fails
        }
      }

      setUploading(false)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image')
      setTimeout(() => setError(null), 5000)
      setUploading(false)
    }
  }

  /**
   * Click handler
   */
  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const avatarSrc = currentImage || DEFAULT_AVATAR

  return (
    <div className="clickable-avatar-wrapper">
      <div
        className={`clickable-avatar ${uploading ? 'uploading' : ''}`}
        onClick={handleClick}
        title="Click to change profile picture"
      >
        <img
          src={avatarSrc}
          alt="Profile"
          className="avatar-image"
          onError={(e) => {
            e.target.src = DEFAULT_AVATAR
          }}
        />
        
        {/* Hover overlay with camera icon */}
        <div className="avatar-overlay">
          {uploading ? (
            <>
              <div className="upload-spinner-small"></div>
              <span className="overlay-text">Uploading...</span>
            </>
          ) : (
            <>
              <div className="camera-icon">📷</div>
              <span className="overlay-text">Change Photo</span>
            </>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileInput}
        className="hidden-file-input"
        disabled={uploading}
      />

      {/* Error message */}
      {error && (
        <div className="avatar-upload-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
    </div>
  )
}

export default ClickableAvatar