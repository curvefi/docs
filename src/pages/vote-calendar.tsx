import React from 'react'
import Head from '@docusaurus/Head'
import BrowserOnly from '@docusaurus/BrowserOnly'

function VoteCalendarLoading() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#3465a4',
      fontFamily: 'System, monospace',
      color: 'white',
      fontSize: 14,
    }}>
      Loading Vote Calendar…
    </div>
  )
}

export default function VoteCalendarPage() {
  return (
    <>
      <Head>
        <title>Vote Calendar | Curve Docs</title>
        <meta name="description" content="Calendar of Curve DAO governance votes — ownership & parameter proposals, with start/end dates, descriptions and live tallies." />
        <meta property="og:title" content="Curve Vote Calendar" />
        <meta property="og:description" content="Calendar of Curve DAO governance votes — ownership & parameter proposals, with start/end dates, descriptions and live tallies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://docs.curve.finance/vote-calendar" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <BrowserOnly fallback={<VoteCalendarLoading />}>
        {() => {
          const VoteCalendar = require('@site/src/components/VoteCalendar').default
          return <VoteCalendar />
        }}
      </BrowserOnly>
    </>
  )
}
