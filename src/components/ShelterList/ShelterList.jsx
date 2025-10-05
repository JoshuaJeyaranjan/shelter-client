import React, { useState, useEffect } from 'react'
import { getShelters } from '../../api/shelters'
import { getSheltersMetadata } from '../../api/metadata'
import './ShelterList.scss'

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

  const getGoogleMapsLink = shelter => {
    if (!shelter.address || !shelter.city) return '#'
    const query = encodeURIComponent(
      `${shelter.address}, ${shelter.city}, ${shelter.province || ''}`
    )
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

  // Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      const meta = await getSheltersMetadata()

      if (meta.lastRefreshed) {
        // Convert UTC to Toronto time
        const torontoTime = new Date(meta.lastRefreshed).toLocaleString(
          'en-CA',
          {
            timeZone: 'America/Toronto'
          }
        )

        setMetadata({ lastRefreshed: torontoTime })
      } else {
        setMetadata({ lastRefreshed: null })
      }
    }

    fetchMetadata()
  }, [])
  // Fetch shelters
  const fetchShelters = async () => {
    setLoading(true)
    try {
      const { shelters: fetchedShelters } = await getShelters(filters)
      const sheltersArray = Array.isArray(fetchedShelters)
        ? fetchedShelters
        : []

      // Sort by unoccupied rooms first, then beds
      const sorted = sheltersArray.sort((a, b) => {
        const roomsDiff = (b.unoccupied_rooms || 0) - (a.unoccupied_rooms || 0)
        if (roomsDiff !== 0) return roomsDiff
        return (b.unoccupied_beds || 0) - (a.unoccupied_beds || 0)
      })

      setShelters(sorted)

      // Populate all sectors/cities once
      if (allSectors.length === 0) {
        setAllSectors(
          Array.from(
            new Set(sheltersArray.map(s => s.sector).filter(Boolean))
          ).sort()
        )
      }
      if (allCities.length === 0) {
        setAllCities(
          Array.from(
            new Set(sheltersArray.map(s => s.city).filter(Boolean))
          ).sort()
        )
      }
    } catch (err) {
      console.error('Error fetching shelters:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShelters()
  }, [])

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
        <select
          name='sector'
          value={filters.sector}
          onChange={handleFilterChange}
        >
          <option value=''>All Sectors</option>
          {allSectors.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select name='city' value={filters.city} onChange={handleFilterChange}>
          <option value=''>All Cities</option>
          {allCities.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
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
        <button
          className='full-capacity-button'
          onClick={() => setShowFullCapacity(!showFullCapacity)}
        >
          {showFullCapacity
            ? 'Hide Full Capacity Shelters'
            : 'Show Full Capacity Shelters'}
        </button>
      </div>

      <div className='shelter-summary' style={{ marginBottom: '1rem' }}>
        Showing {showFullCapacity ? totalShelters : availableShelters} out of{' '}
        {totalShelters} shelters
      </div>

      {metadata?.lastRefreshed && (
        <div className='last-refreshed'>
          Last Refreshed: {metadata.lastRefreshed}
        </div>
      )}

      {loading ? (
        <p>Loading shelters...</p>
      ) : shelters.length === 0 ? (
        <p>No shelters found.</p>
      ) : (
        <ul className='shelter-list'>
          {shelters
            .filter(
              s =>
                showFullCapacity ||
                s.unoccupied_beds > 0 ||
                s.unoccupied_rooms > 0
            )
            .map(shelter => {
              const hasBeds =
                shelter.capacity_actual_bed != null &&
                shelter.capacity_actual_bed > 0
              const hasRooms =
                shelter.capacity_actual_room != null &&
                shelter.capacity_actual_room > 0

              const fullCapacity =
                (hasBeds &&
                  (shelter.occupied_beds || 0) >=
                    shelter.capacity_actual_bed) ||
                (hasRooms &&
                  (shelter.occupied_rooms || 0) >= shelter.capacity_actual_room)

              return (
                <li
                  key={shelter.id}
                  className={`shelter-item ${
                    fullCapacity ? 'full-capacity' : ''
                  }`}
                >
                  <h3>{shelter.location_name}</h3>

                  <p>
                    <strong>Sector:</strong> {shelter.sector || 'N/A'}
                  </p>

                  {hasBeds && (
                    <p>
                      <strong>Beds:</strong> {shelter.occupied_beds || 0} /{' '}
                      {shelter.capacity_actual_bed}
                    </p>
                  )}

                  {hasRooms && (
                    <p>
                      <strong>Rooms:</strong> {shelter.occupied_rooms || 0} /{' '}
                      {shelter.capacity_actual_room}
                    </p>
                  )}

                  {shelter.overnight_service_type && (
                    <p>
                      <strong>Service Type:</strong>{' '}
                      {shelter.overnight_service_type}
                    </p>
                  )}

                  {shelter.address && (
                    <p>
                      <strong>📍 Address:</strong>{' '}
                      <a
                        className='address-link'
                        href={getGoogleMapsLink(shelter)}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {shelter.address}, {shelter.city}, {shelter.province}{' '}
                        {shelter.postal_code}
                      </a>
                    </p>
                  )}

                  <p>
                    <strong>Organization:</strong>{' '}
                    {shelter.organization_name || 'N/A'}
                  </p>
    
                  <p>
                    <strong>Group:</strong> {shelter.shelter_group || 'N/A'}
                  </p>
                  <p>
                    <strong>Program:</strong> {shelter.program_name || 'N/A'}
                  </p>

                  {shelter.occupancy_date && (
                    <p>
                      <strong>Last Updated:</strong>{' '}
                      {new Date(shelter.occupancy_date).toLocaleDateString()}
                    </p>
                  )}

                  {fullCapacity && <span className='full-badge'>FULL</span>}

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
