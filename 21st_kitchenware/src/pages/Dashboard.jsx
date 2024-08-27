import React, { useEffect, useState } from 'react';
import CardAnalytics from '../components/CardAnalytics';
import { DateRangePicker, Input, Pagination } from '@nextui-org/react';
import OrderTable from '../components/OrderTable';
import { collection, getDocs, getFirestore, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import '../firebaseConfig';
import {startOfMonth} from 'date-fns';
import { parseDate } from '@internationalized/date';
import useDebounce from '../hooks/useDebounce';

export default function Dashboard() {

    const db = getFirestore();
    
    const [approved,setApproved] = useState(0);
    const [billed,setBilled] = useState(0);
    const [cancelled,setConcelled] = useState(0);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderSearch, setOrderSearch] = useState("");
    const debounceSearchId = useDebounce(orderSearch, 500);
    const [endDate,setEndDate] = useState(new Date());
    const [startDate,setStartDate] = useState(startOfMonth(new Date()));

      useEffect(() => {
        let q = null;
        console.log(startDate + " " + endDate);
        console.log(orderSearch);
        
        if (orderSearch !== "") {
          q = query(
            collection(db, "order_table"),
            where("order_id", "==", orderSearch)
          );
        } else {
          q = query(
            collection(db, "order_table"),
            where("timestamp", ">=", Timestamp.fromDate(startDate)), // Use Firestore Timestamp
            where("timestamp", "<=", Timestamp.fromDate(endDate)),   // Use Firestore Timestamp
            orderBy("timestamp", "desc")
          );
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          let a = 0;
          let b = 0;
          let c = 0;            
          const ordersData = [];
          snapshot.forEach((doc) => {
            ordersData.push({id: doc.id,
                ...doc.data(),});
            if(doc.data().status == 'Billed') {
                a ++;
            } else if(doc.data().status == 'Approved') {
                b ++;
            } else if(doc.data().status == 'Cancelled') {
                c ++;
            }
          })
          setOrders(ordersData);
          setApproved(a);
          setBilled(b);
          setConcelled(c);
          setLoading(false);
        });
        return () => unsubscribe();
    }, [startDate, endDate , debounceSearchId]);

  return (
    <div>
      <CardAnalytics approved={approved} billed={billed} cancelled={cancelled}/>
      <div className="flex justify-between px-4 py-4 gap-2">
        <Input
          label="Search"
          placeholder="Enter Order Id"
          className="max-w-xs"
          onChange={(e) => setOrderSearch(e.target.value)}
        />
        <DateRangePicker 
         defaultValue={{
            start: parseDate(startDate.toISOString().split('T')[0]),
            end: parseDate(endDate.toISOString().split('T')[0]),
          }}
        label="Stay duration" className="max-w-xs bg-background" onChange={(e) => {
            setEndDate(new Date(e.end.year,e.end.month-1,e.end.day));
            setStartDate(new Date(e.start.year,e.start.month - 1,e.start.day));
        }} />

      </div>
      <div className="flex flex-col gap-4 px-2 py-4 items-center">
      <OrderTable orders={orders}/>
      </div>
    </div>
  )
}
