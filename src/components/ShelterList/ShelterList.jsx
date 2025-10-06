import React, { useState, useEffect } from 'react'
import { getShelters } from '../../api/shelters'
import { getSheltersMetadata } from '../../api/metadata'
import './ShelterList.scss'

// Haversine formula to compute distance in km
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const ShelterList = () => {
  const [shelters, setShelters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    sector: '',
    city: '',
    minVacancyBeds: '',
    minVacancyRooms: ''
  })
  const [allSectors, setAllSectors] = useState([])
  const [allCities, setAllCities] = useState([])
  const [showFullCapacity, setShowFullCapacity] = useState(false)
  const [metadata, setMetadata] = useState({ lastRefreshed: null })
  const [userLocation, setUserLocation] = useState(null)

  const getGoogleMapsLink = shelter => {
    if (!shelter.address || !shelter.city) return '#'
    const query = encodeURIComponent(
      `${shelter.address}, ${shelter.city}, ${shelter.province || ''}`
    )
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

  // Ask for user geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      err => console.warn('Geolocation not available or denied:', err)
    )
  }, [])

  // Fetch metadata
useEffect(() => {
  const fetchMetadata = async () => {
    try {
      const meta = await getSheltersMetadata();

      if (meta?.lastRefreshed) {
      
        const torontoTime = new Date(meta.lastRefreshed).toLocaleString('en-CA', {
          timeZone: 'America/Toronto',
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
          console.log('given api time:', meta)
        console.log('Toronto Time:', torontoTime)
        setMetadata({ lastRefreshed: torontoTime });
      } else {
        setMetadata({ lastRefreshed: null });
      }
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  fetchMetadata();
}, []);

  const fetchShelters = async () => {
    setLoading(true)
    try {
      const { shelters: fetchedShelters } = await getShelters(filters)
      const sheltersArray = Array.isArray(fetchedShelters) ? fetchedShelters : []

      // Compute distance if we have user location
      const withDistance = userLocation
        ? sheltersArray.map(s => ({
            ...s,
            distance:
              s.latitude && s.longitude
                ? getDistanceKm(userLocation.latitude, userLocation.longitude, s.latitude, s.longitude)
                : null
          }))
        : sheltersArray

      // Sort by distance first, then by unoccupied rooms/beds
      const sorted = withDistance.sort((a, b) => {
        if (userLocation) {
          const distA = a.distance ?? Infinity
          const distB = b.distance ?? Infinity
          if (distA !== distB) return distA - distB
        }
        const roomsDiff = (b.unoccupied_rooms || 0) - (a.unoccupied_rooms || 0)
        if (roomsDiff !== 0) return roomsDiff
        return (b.unoccupied_beds || 0) - (a.unoccupied_beds || 0)
      })

      setShelters(sorted)

      // Populate all sectors/cities once
      if (allSectors.length === 0) {
        setAllSectors(Array.from(new Set(sheltersArray.map(s => s.sector).filter(Boolean))).sort())
      }
      if (allCities.length === 0) {
        setAllCities(Array.from(new Set(sheltersArray.map(s => s.city).filter(Boolean))).sort())
      }
    } catch (err) {
      console.error('Error fetching shelters:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShelters()
  }, [userLocation]) // refetch when location available

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => fetchShelters()

  const totalShelters = shelters.length
  const availableShelters = shelters.filter(
    s => s.unoccupied_beds > 0 || s.unoccupied_rooms > 0
  ).length

  return (
    <div className='shelter-list-container'>
      <h1>Toronto Shelters</h1>

      <div className='filters'>
        <select name='sector' value={filters.sector} onChange={handleFilterChange}>
          <option value=''>All Sectors</option>
          {allSectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select name='city' value={filters.city} onChange={handleFilterChange}>
          <option value=''>All Cities</option>
          {allCities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input
          type='number'
          placeholder='Min Beds'
          name='minVacancyBeds'
          value={filters.minVacancyBeds}
          onChange={handleFilterChange}
        />
        <input
          type='number'
          placeholder='Min Rooms'
          name='minVacancyRooms'
          value={filters.minVacancyRooms}
          onChange={handleFilterChange}
        />

        <button onClick={applyFilters}>Search</button>
      </div>

      <div style={{ margin: '1rem 0' }}>
        <button className='full-capacity-button' onClick={() => setShowFullCapacity(!showFullCapacity)}>
          {showFullCapacity ? 'Hide Full Capacity Shelters' : 'Show Full Capacity Shelters'}
        </button>
      </div>

      <div className='shelter-summary'>
        Showing {showFullCapacity ? totalShelters : availableShelters} out of {totalShelters} shelters
      </div>

      {metadata?.lastRefreshed && <div className='last-refreshed'>Last Refreshed: {metadata.lastRefreshed}</div>}

{loading ? (
  <p>Loading shelters...</p>
) : shelters.length === 0 ? (
  <p>No shelters found.</p>
) : (
  <ul className='shelter-list'>
    {shelters
      .filter(s => showFullCapacity || s.unoccupied_beds > 0 || s.unoccupied_rooms > 0)
      .map(shelter => {
        const hasBeds = shelter.capacity_actual_bed > 0
        const hasRooms = shelter.capacity_actual_room > 0
        const fullCapacity = (hasBeds && (shelter.occupied_beds || 0) >= shelter.capacity_actual_bed) ||
                             (hasRooms && (shelter.occupied_rooms || 0) >= shelter.capacity_actual_room)

        return (
          <li key={shelter.id} className={`shelter-item ${fullCapacity ? 'full-capacity' : ''}`}>
            <h3>{shelter.location_name}</h3>
            <p><strong>Sector:</strong> {shelter.sector || 'N/A'}</p>
            {hasBeds && <p><strong>Beds:</strong> {shelter.occupied_beds || 0} / {shelter.capacity_actual_bed}</p>}
            {hasRooms && <p><strong>Rooms:</strong> {shelter.occupied_rooms || 0} / {shelter.capacity_actual_room}</p>}
            {shelter.address && (
              <p>
                <strong>📍 Address:</strong>{' '}
                <a href={getGoogleMapsLink(shelter)} target="_blank" rel="noopener noreferrer">
                  {shelter.address}, {shelter.city}, {shelter.province}
                </a>
              </p>
            )}
            {shelter.distance && <p><strong>Distance:</strong> {shelter.distance.toFixed(1)} km</p>}
            {fullCapacity && <span className='full-badge'>FULL</span>}

            {/* Google Map iframe */}
            {shelter.address && shelter.city && (
              <div className="map-container" style={{ marginTop: "0.5rem" }}>
                <iframe
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    `${shelter.address}, ${shelter.city}, ${shelter.province || ""}`
                  )}&z=15&output=embed`}
                ></iframe>
              </div>
            )}
          </li>
        )
      })}
  </ul>
)}
    </div>
  )
}

export default ShelterList