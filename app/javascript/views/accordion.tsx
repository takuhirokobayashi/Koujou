import React from 'react'
import { AccordionProvider } from './accordion_context'

type Props = {
  children: React.ReactNode,
}

export default function Accordion( props: Props ) {
  return (
    <AccordionProvider>
      { props.children }
    </AccordionProvider>
  )
}
