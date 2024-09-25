import React from 'react'
import { createRoot } from 'react-dom/client'

import CityConquestSummary from './city_conquest_summary'

declare global {
  var cityConquestSummary: ( divTagId: string ) => void
}

globalThis.cityConquestSummary = ( divTagId: string, ) => {
  const container = document.getElementById( divTagId )
  if ( container ) {
    const root = createRoot( container )
    root.render(
      React.createElement( CityConquestSummary )
    )
  }
}
