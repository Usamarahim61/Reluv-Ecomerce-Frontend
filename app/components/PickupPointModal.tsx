"use client";
import React, { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import { X, MapPin, Loader2 } from "lucide-react";

interface PickupPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string, lat: number, lng: number) => void;
}

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 41.6561,
  lng: -4.7239, // Traspinedo, Spain default
};

const PickupPointModal: React.FC<PickupPointModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  }, []);

  // When user picks from search suggestions
  const onPlacesChanged = useCallback(() => {
    const places = searchBoxRef.current?.getPlaces();
    if (!places || places.length === 0) return;

    const place = places[0];
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();
    const address = place.formatted_address || place.name || "";

    if (lat && lng) {
      setMarkerPos({ lat, lng });
      setSelectedAddress(address);
      mapRef.current?.panTo({ lat, lng });
      mapRef.current?.setZoom(15);
    }
  }, []);

  // When user clicks directly on the map
  const onMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (!lat || !lng) return;

    setMarkerPos({ lat, lng });

    // Reverse geocode to get address from coordinates
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setSelectedAddress(results[0].formatted_address);
      } else {
        setSelectedAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    });
  }, []);

  const handleConfirm = () => {
    if (!markerPos || !selectedAddress) return;
    onConfirm(selectedAddress, markerPos.lat, markerPos.lng);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white w-full max-w-2xl rounded-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Choose a pick-up point
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Map Area */}
        <div className="relative">
          {!isLoaded ? (
            <div className="h-[400px] flex items-center justify-center bg-gray-50">
              <Loader2 className="animate-spin text-teal-600" size={32} />
            </div>
          ) : (
            <>
              {/* Search Box overlaid on map */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-[85%]">
                <StandaloneSearchBox
                  onLoad={onSearchBoxLoad}
                  onPlacesChanged={onPlacesChanged}
                >
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    className="w-full px-4 py-2.5 text-sm rounded-sm border border-gray-300 shadow-md outline-none focus:border-teal-500"
                  />
                </StandaloneSearchBox>
              </div>

              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={13}
                onLoad={onMapLoad}
                onClick={onMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                {markerPos && <Marker position={markerPos} />}
              </GoogleMap>
            </>
          )}
        </div>

        {/* Selected Address Preview */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
          {selectedAddress ? (
            <div className="flex items-start gap-2 mb-4">
              <MapPin size={16} className="text-teal-600 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-700">{selectedAddress}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">
              Click on the map or search to select a pick-up point
            </p>
          )}

          <button
            onClick={handleConfirm}
            disabled={!selectedAddress}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-sm transition-colors text-sm"
          >
            Confirm pick-up point
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickupPointModal;