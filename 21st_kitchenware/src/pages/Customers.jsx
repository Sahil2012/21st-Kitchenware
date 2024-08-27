import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";

export default function Customers() {
  const db = getFirestore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currDealer, setCurrDealer] = useState({ name: "", city: "" });
  const [dealers, setDealers] = useState([]);
  const [newDealer, setNewDealer] = useState({ name: "", city: "" });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const pages = Math.ceil(dealers.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return dealers.slice(start, end);
  }, [page, dealers]);

  const handleUpdateClick = async (id) => {
    if (currDealer.name.trim() === "" || currDealer.city.trim() === "") {
      alert("Dealer name and city cannot be empty.");
      return;
    }

    const dealerExists = dealers.some(
      (d) => d.name === currDealer.name && d.city === currDealer.city
    );

    if (dealerExists) {
      alert("Dealer with this name and city already exists.");
      return;
    }

    try {
      const dealerDoc = doc(db, "dealer", id);
      await updateDoc(dealerDoc, { name: currDealer.name, city: currDealer.city });

      setDealers((prevDealers) =>
        prevDealers.map((dealer) =>
          dealer.id === id ? { ...dealer, name: currDealer.name, city: currDealer.city } : dealer
        )
      );

      alert("Dealer updated successfully.");
    } catch (error) {
      console.log(error);
      alert("Something went wrong, try updating later.");
    }

    setCurrDealer({ name: "", city: "" });
  };

  const addDealer = async () => {
    if (newDealer.name.trim() !== "" && newDealer.city.trim() !== "") {
      const dealerExists = dealers.some(
        (d) => d.name === newDealer.name && d.city === newDealer.city
      );

      if (dealerExists) {
        alert("Dealer with this name and city already exists.");
        return;
      }

      try {
        const dealerCollection = collection(db, "dealer");
        const op = await addDoc(dealerCollection, { name: newDealer.name, city: newDealer.city });
        setDealers([...dealers, { name: newDealer.name, city: newDealer.city, id: op.id }]);
      } catch (error) {
        alert("Something went wrong, try adding later.");
      }
    } else {
      alert("Enter Dealer Name and City to add.");
    }
  };

  useEffect(() => {
    const q = query(collection(db, "dealer"));
    const unsubscribe = onSnapshot(q, (querySnapShot) => {
      const dealerData = [];
      querySnapShot.forEach((doc) => {
        dealerData.push({ id: doc.id, ...doc.data() });
      });
      setDealers(dealerData);
    });

    return () => unsubscribe();
  }, []);

  const classNames = React.useMemo(
    () => ({
      base: [ "max-w-3xl"],
      wrapper: ["max-w-3xl"],
    }),
    []
  );

  return (
    <>
      <div className="flex justify-center">
        <div className="py-4 flex gap-4 items-center w-full max-w-3xl px-2 justify-center">
          

            <Input
              size="sm"
              type="Text"
              label="Dealer Name"
              onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
            />
            <Input
              size="sm"
              type="Text"
              label="City"
              onChange={(e) => setNewDealer({ ...newDealer, city: e.target.value })}
            />
            <Button color="primary" onClick={addDealer}>
              Add New
            </Button>
          
        </div>
      </div>
      <div className="flex justify-center items-center">
        <Table
          aria-label="Dealers Table"
          bottomContent={
            pages > 1 ? (
              <div className="flex justify-center">
                <Pagination
                  total={pages}
                  page={page}
                  onChange={(page) => setPage(page)}
                  initialPage={1}
                />
              </div>
            ) : null
          }
          classNames={classNames}
        >
          <TableHeader>
            <TableColumn>Dealer Name</TableColumn>
            <TableColumn>City</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody items={items}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.city}</TableCell>
                <TableCell>
                  <Chip
                    className="capitalize cursor-pointer"
                    color="success"
                    size="sm"
                    variant="flat"
                    onClick={() => {
                      setCurrDealer(item);
                      onOpen();
                    }}
                  >
                    Edit
                  </Chip>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal  backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Dealer Details
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  onChange={(e) => setCurrDealer({ ...currDealer, name: e.target.value })}
                  value={currDealer.name}
                  label="Dealer Name"
                  variant="bordered"
                />
                <Input
                  onChange={(e) => setCurrDealer({ ...currDealer, city: e.target.value })}
                  value={currDealer.city}
                  label="City"
                  variant="bordered"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  onClick={() => {
                    handleUpdateClick(currDealer.id);
                    onClose();
                  }}
                >
                  Update
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
