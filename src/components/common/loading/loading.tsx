import React from 'react'

type Props = {
  message?: string;
}

const loading = (props: Props) => {
  const { message } = props;
  return (
      <div className="flex items-center justify-center absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          {message && <p className="mt-4 opacity-50">{message}</p>}
        </div>
      </div>
  )
}

export default loading