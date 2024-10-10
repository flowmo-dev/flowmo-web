import React from 'react'
import { X } from 'lucide-react'

interface MenuProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-gray-800 w-80 h-full p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Menu</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Menu