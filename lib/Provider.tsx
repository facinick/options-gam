"use client"
import React, { useState, ReactNode } from "react"
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

function Provider({ children }: {children: ReactNode}) {
    const [client] = useState(new QueryClient())

  return (
    <>
      <QueryClientProvider client={client}>
        <ReactQueryStreamedHydration>
            {children}
        </ReactQueryStreamedHydration>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  )
}

export { Provider }