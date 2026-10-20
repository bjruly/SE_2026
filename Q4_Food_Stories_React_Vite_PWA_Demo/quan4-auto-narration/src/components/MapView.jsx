import React, { useEffect, useRef } from 'react'
import L from 'leaflet'

export default function MapView({ pois, selectedId, userLocation, radius, emptyMessage, onSelect, onMapReady }) {
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const userMarkerRef = useRef(null)
  const radiusCircleRef = useRef(null)

  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = L.map(elRef.current, { zoomControl: false }).setView([10.762, 106.704], 15)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)
    mapRef.current = map
    onMapReady?.({
      focus: (lat, lng, zoom = 17) => map.flyTo([lat, lng], zoom, { duration: 0.7 })
    })
    setTimeout(() => map.invalidateSize(), 100)
    return () => { map.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}
    pois.forEach(poi => {
      const marker = L.marker([poi.lat, poi.lng], {
        icon: L.divIcon({
          className: 'poi-map-icon',
          html: `<div class="map-pin ${selectedId === poi.id ? 'active' : ''}" style="--pin:${poi.color}"><span>${poi.icon}</span></div>`,
          iconSize: [42, 48], iconAnchor: [21, 43]
        })
      }).addTo(map)
      marker.on('click', () => onSelect(poi.id))
      marker.bindTooltip(poi.name.vi, { direction: 'top', offset: [0, -30] })
      markersRef.current[poi.id] = marker
    })
  }, [pois, selectedId, onSelect])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (userMarkerRef.current) userMarkerRef.current.remove()
    if (radiusCircleRef.current) radiusCircleRef.current.remove()
    if (!userLocation) return
    radiusCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
      radius,
      color: '#2563eb',
      weight: 1,
      fillColor: '#2563eb',
      fillOpacity: 0.08
    }).addTo(map)
    userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 8, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1
    }).addTo(map).bindTooltip('Vị trí của bạn')
  }, [userLocation, radius])

  return (
    <div className="map-canvas">
      <div className="map-viewport" ref={elRef} aria-label="Bản đồ địa điểm ẩm thực" />
      {userLocation && pois.length === 0 && <div className="map-empty-state">{emptyMessage}</div>}
    </div>
  )
}