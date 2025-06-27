import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <>
    <div className="parent fixed top-0 z-50 py-2">
        <div className="container">
            <Link href="/">
            <Image src="/logo.svg" alt="Viximate Logo" width={100} height={24}  />
            </Link>
        </div>
    </div>
    
    
    </>
  )
}

export default Header