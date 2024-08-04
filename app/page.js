"use client";
import Image from "next/image";
import { useEffect, useState } from 'react';
import { firestore } from '../firebase'; // Adjusted the import path
import { Box, Typography, Modal, Stack, TextField, Button } from '@mui/material';
import { collection, query, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export default function Home() {
  const [item, setItem] = useState('');
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false); // Added useState for open

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const updatePantry = async () => {
    const pantryRef = query(collection(firestore, 'pantry'));
    const docs = await getDocs(pantryRef); // Corrected function name
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setPantry(pantryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, {
        quantity: quantity + 1,
      });
    } else {
      await setDoc(docRef, {
        quantity: 1,
      });
    }
    await updatePantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          quantity: quantity - 1,
        });
      }
      await updatePantry();
    }
  };

  useEffect(() => {
    updatePantry();
  }, []);

  return (
      <Box width="100vw" height="100vh" display="flex" justifyContent="center" gap={2}>
        <Modal open={open} onClose={handleClose}>
          <Box position="absolute" top="50%" left="50%" bgcolor="white" p={2} width={400} boxShadow={24} display="flex" sx={{ transform: "translate(-50%, -50%)" }}>
            <Typography variant="h6">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField label="Item" value={item} onChange={(e) => setItem(e.target.value)} />
              <Button variant="contained" onClick={() => addItem(item)}>Add</Button>
            </Stack>
          </Box>
        </Modal>
        <Typography variant="h1">Pantry Tracker</Typography>
      </Box>
  );
}