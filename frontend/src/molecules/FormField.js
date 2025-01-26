import React from 'react'
import { Label } from '../atoms/Label'
import { Input } from '../atoms/Input'

const FormField = ({ label, id, error, ...props }) => {
  return (
    <div className="space-y-2 p-2 border-[2px] rounded-lg border-orange-100">
      <Label htmlFor={id} className=" border-none">{label}</Label>
      <Input id={id} {...props} />
      {error && <p className="text-sm text-destructive border-none">{error}</p>}
    </div>
  )
}

export default FormField

