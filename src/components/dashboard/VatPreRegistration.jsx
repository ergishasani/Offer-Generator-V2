import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db }      from '../../services/firebase'
import { collection, where, query, getDocs } from 'firebase/firestore'
import { addMonths, format } from 'date-fns'
import Card from '../Card'

export default function VatPreRegistration() {
  const { user } = useAuth()
  const [vatDue, setVatDue] = useState(0)

  useEffect(()=>{
    if(!user) return
    async function fetchVat(){
      const col = collection(db,'users',user.uid,'offers')
      const snap = await getDocs(query(col, where('status','==','accepted')))
      let vatSum=0
      snap.forEach(d=>{
        vatSum += d.data().vatAmount||0
      })
      setVatDue(vatSum)
    }
    fetchVat()
  },[user])

  // assume monthly: due 10th next month
  const now = new Date()
  const dueDate = format(addMonths(new Date(now.getFullYear(), now.getMonth(),10),1),
                       'dd.MM.yyyy')

  return (
    <Card className="dashboard-card vat-prereg">
      <h3>Umsatzsteuer-Voranmeldung</h3>
      <div className="vat-grid">
        <div>
          <small>Zahllast {format(now,'MMM yy')}</small>
          <div className="big-amount">{vatDue.toFixed(2)} €</div>
        </div>
        <div>
          <small>Fällig am</small>
          <div>{dueDate}</div>
        </div>
      </div>
    </Card>
  )
}
