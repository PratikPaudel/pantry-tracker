"use client"
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { collection, query, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase'; // Adjust the import path as necessary

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllItems, setShowAllItems] = useState(false);

  const updatePantry = async () => {
    const pantryRef = query(collection(firestore, 'pantry'));
    const docs = await getDocs(pantryRef);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setPantry(pantryList);
  };

  const addItem = async (name, quantity, expiryDate) => {
    const docRef = doc(collection(firestore, 'pantry'), name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, {
        quantity: existingQuantity + parseInt(quantity),
        expiryDate,
      });
    } else {
      await setDoc(docRef, {
        quantity: parseInt(quantity),
        expiryDate,
      });
    }
    await updatePantry();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAddingItem(true);
    await addItem(name, quantity, expiryDate);
    setIsAddingItem(false);
    setName('');
    setQuantity('');
    setExpiryDate('');
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const filteredPantry = pantry.find((item) =>
      item.name.toLowerCase() === searchTerm.toLowerCase()
  );

  return (
      <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
        <TextField
            label="Search Items"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: '20px', width: '80%' }}
        />
        <Typography variant="h1">Pantry Tracker</Typography>
        <form onSubmit={handleSubmit} className="form" style={{ width: '50%' }}>
          <Typography variant="h6" style={{ fontSize: '30px', textAlign: 'center', color: 'green' }}>Add Item </Typography>
          <TextField
              type="text"
              value={name}
              placeholder="Enter item name"
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              style={{ marginBottom: '10px' }}
          />
          <TextField
              type="number"
              value={quantity}
              placeholder="Enter Quantity"
              onChange={(e) => setQuantity(e.target.value)}
              required
              fullWidth
              style={{ marginBottom: '10px' }}
          />
          <TextField
              type="date"
              label="Expiry Date"
              InputLabelProps={{ shrink: true }}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              fullWidth
              style={{ marginBottom: '10px' }}
          />
          <Button type="submit" variant="contained" fullWidth>{isAddingItem ? 'Adding Item...' : 'Add Item'}</Button>
        </form>
        <Button variant="outlined" onClick={() => setShowAllItems(!showAllItems)} style={{ marginTop: '20px' }}>
          {showAllItems ? 'Hide All Items' : 'Show All Items'}
        </Button>
        <Box mt={2} width="80%" display="flex" flexDirection="column" alignItems="center">
          {showAllItems ? (
              pantry.map(item => (
                  <Box key={item.name} p={2} width="100%" display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #ccc">
                    <Typography variant="body1" style={{ flex: 1 }}>{item.name}</Typography>
                    <Typography variant="body1" style={{ flex: 1, textAlign: 'center' }}>Quantity: {item.quantity}</Typography>
                    <Typography variant="body1" style={{ flex: 1, textAlign: 'right' }}>Expiry Date: {item.expiryDate}</Typography>
                  </Box>
              ))
          ) : filteredPantry ? (
              <Box key={filteredPantry.name} p={2} width="100%" display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #ccc">
                <Typography variant="body1" style={{ flex: 1 }}>{filteredPantry.name}</Typography>
                <Typography variant="body1" style={{ flex: 1, textAlign: 'center' }}>Quantity: {filteredPantry.quantity}</Typography>
                <Typography variant="body1" style={{ flex: 1, textAlign: 'right' }}>Expiry Date: {filteredPantry.expiryDate}</Typography>
              </Box>
          ) : searchTerm ? (
              <Typography variant="body1">No items found</Typography>
          ) : null}
        </Box>
      </Box>
  );
}
