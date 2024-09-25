import React, { useState, useEffect, } from 'react'
import { css, } from '@emotion/css'

import { useAccordion } from './accordion_context'

type Props = {
  add_error_message: ( val: string, ) => void,
  title: string,
  children: React.ReactNode,
}

export default function AccordionItem( props: Props ) {
  const { open_index, handle_toggle } = useAccordion()
  const id = React.useId()

  return (
    <React.Fragment>
      <div
        className = {
          css( {
            backgroundColor: '#007BFF',
            color: '#FFFFFF',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '4px',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            ':hover': {
              backgroundColor: '#0056b3',
            },
          } )
        }
        onClick = { () => handle_toggle( id ) }
      >
        { props.title }
      </div>
      {
        open_index === id && (
          <div>
            { props.children }
          </div>
        )
      }
    </React.Fragment>
  )
}
