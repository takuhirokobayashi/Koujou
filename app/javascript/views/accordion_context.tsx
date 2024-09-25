import React, { createContext, useState, useContext, } from 'react'

type AccordionContextType = {
  open_index: null | string,
  handle_toggle: ( index: string, ) => void,
}

const AccordionContext = createContext<AccordionContextType | undefined>( undefined )

export const AccordionProvider = ( { children }: { children: React.ReactNode } ) => {
  const [openIndex, setOpenIndex] = useState<null | string>( null )

  const handleToggle = ( index: string, ) => {
    setOpenIndex( prevIndex => ( prevIndex === index ? null : index ) )
  }

  return (
    <AccordionContext.Provider
      value = {
        {
          open_index: openIndex,
          handle_toggle: handleToggle,
        }
      }
    >
      { children }
    </AccordionContext.Provider>
  )
}

export const useAccordion = () => {
  const context = useContext( AccordionContext )

  if ( ! context ) {
    throw new Error( 'useAccordion must be used within an AccordionProvider' )
  }

  return context
}
