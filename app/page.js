"use client"
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { collection, query, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
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

  const deleteItem = async (name) => {
    const docRef = doc(collection(firestore, 'pantry'), name);
    await deleteDoc(docRef);
    await updatePantry();
  };

  const removeItemByOne = async (name, quantity, expiryDate) => {
    const docRef = doc(collection(firestore, 'pantry'), name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      if (existingQuantity > 0) {
        await setDoc(docRef, {
          quantity: existingQuantity - 1,
          expiryDate: expiryDate,
        });
      }
    }
    await updatePantry();
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
      <Box width="100vw" height="auto" display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
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
          <Button type="submit" variant="contained" fullWidth style={{ marginBottom: '10px' }}>{isAddingItem ? 'Adding Item...' : 'Add Item'}</Button>
        </form>
        <TextField
            label="Search Items"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ marginTop: '10px', width: '80%' }}
        /> 
        <Button variant="outlined" onClick={() => setShowAllItems(!showAllItems)} style={{ marginTop: '20px' }}>
          {showAllItems ? 'Hide All Items' : 'Show All Items'}
        </Button>
        <Box mt={2} width="80%" overflow="auto" display="flex" flexDirection="column" alignItems="center">
          {showAllItems ? (
              pantry.map(item => (
                  <Box key={item.name} p={2} width="100%" display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #ccc">
                    <Typography variant="body1" style={{ flex: 1 }}>{item.name}</Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Button variant="contained" color="success" justifyContent="center" alignItems="center" sx={{ marginRight: '10px' }} onClick={() => addItem(item.name, 1, item.expiryDate)}>+</Button>
                      <Button variant="outlined" color="error" justifyContent="center" alignItems="center" sx={{ marginRight: '10px' }} onClick={() => removeItemByOne(item.name, 1, item.expiryDate)}>-</Button>
                      <Typography variant="h6" gutterBottom>
                        Quantity: {item.quantity}
                      </Typography>
                    </Box>
                    <Typography variant="body1" style={{ flex: 1, textAlign: 'right' }}>Expiry Date: {item.expiryDate}</Typography>
                    <Button
                        variant="outlined"
                        color="error" sx={{ marginLeft: '10px' }}
                        onClick={() => deleteItem(item.name)}
                    >
                      Delete Item
                    </Button>
                  </Box>
              ))
          ) : filteredPantry ? (
              <Box key={filteredPantry.name} p={2} width="100%" display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #ccc">
                <Typography variant="body1" style={{ flex: 1 }}>{filteredPantry.name}</Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Button variant="contained" color="success" justifyContent="center" alignItems="center" sx={{ marginRight: '10px' }} onClick={() => addItem(filteredPantry.name, 1, filteredPantry.expiryDate)}>+</Button>
                  <Button variant="outlined" color="error" justifyContent="center" alignItems="center" sx={{ marginRight: '10px' }} onClick={() => removeItemByOne(filteredPantry.name, 1, filteredPantry.expiryDate)}>-</Button>
                  <Typography variant="h6" gutterBottom>
                    Quantity: {filteredPantry.quantity}
                  </Typography>
                </Box>
                <Typography variant="body1" style={{ flex: 1, textAlign: 'right' }}>Expiry Date: {filteredPantry.expiryDate}</Typography>
                <Button
                    variant="outlined"
                    color="error" sx={{ marginLeft: '10px' }}
                    onClick={() => deleteItem(filteredPantry.name)}
                >
                  Delete Item
                </Button>
              </Box>
          ) : searchTerm ? (
              <Typography variant="body1">No items found</Typography>
          ) : null}
        </Box>
      </Box>
  );
}