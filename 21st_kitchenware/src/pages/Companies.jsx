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
  Tooltip,
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
import { EditIcon } from "../components/EditIcon";
import { PlusIcon } from "../assets/PlusIcon";

export default function Companies() {
  const db = getFirestore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currName, setCurrName] = useState("");
  const [currComp, setCurrComp] = useState({});
  const [company, setCompany] = useState([]);
  const [newComp, setNewComp] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const pages = Math.ceil(company.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return company.slice(start, end);
  }, [page, company]);

  const handleUpdateClick = async (id) => {
    // Check if the new name is empty or already exists in the company list
    if (currName.trim() === "") {
      alert("Company name cannot be empty.");
      return;
    }

    const companyEx = company.some((c) => c.name === currName);

    if (companyEx) {
      alert("Company with this name already exists.");
      return;
    }

    try {
      const companyDoc = doc(db, "company_table", id);
      await updateDoc(companyDoc, { name: currName });

      // Update the local state to reflect the changes
      setCompany((prevCompany) =>
        prevCompany.map((comp) =>
          comp.id === id ? { ...comp, name: currName } : comp
        )
      );

      alert("Company name updated successfully.");
    } catch (error) {
        console.log(error);
        
      alert("Something went wrong, try updating later.");
    }

    setCurrName("");
  };
  const addCompnay = async () => {
    if (newComp.trim() !== "") {
      const companyEx = company.some((c) => c.name === newComp);

      if (companyEx) {
        alert("Company with this Name already exists.");
        return;
      }
      try {
        const compCollection = collection(db, "company_table");
        const op = await addDoc(compCollection, { name: newComp });
        let cl = [...company];
        cl.push({ name: newComp, id: op.id });
        setCompany(cl);
      } catch (error) {
        alert("Something went wrong, try to add later.");
      }
    } else {
      alert("Enter Company Name to add.");
    }
  };

  useEffect(() => {
    const q = query(collection(db, "company_table"));

    const unsubscribe = onSnapshot(q, (querySnapShot) => {
      const compData = [];
      querySnapShot.forEach((doc) => {
        compData.push({ id: doc.id, ...doc.data() });
      });
      setCompany(compData);
    });

    return () => unsubscribe();
  }, []);

  const classNames = React.useMemo(
    () => ({
      base: ["max-h-[382px]", "max-w-3xl"],
      wrapper: ["max-h-[382px]", "max-w-3xl"],
    }),
    []
  );
  return (
    <>
      <div className="flex justify-center">
        <div className="py-4 flex gap-4 items-center w-full max-w-3xl px-2 justify-center">
          {/* <Input size="sm" type="Text" label="Search" /> */}

          
            <Input
              size="sm"
              type="Text"
              label="Company Name"
              onChange={(e) => setNewComp(e.target.value)}
            />
            <Button color="primary" onClick={addCompnay}>
              Add New
            </Button>
          
        </div>
      </div>
      <div className="flex justify-center items-center">
        <Table
          aria-label="Companies Table"
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
            {/* <TableColumn>S.no.</TableColumn> */}
            <TableColumn>Company Name</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody items={items}>
            {(item) => (
              <TableRow key={item.id}>
                {/* <TableCell>1</TableCell> */}
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Chip
                    className="capitalize cursor-pointer"
                    color="success"
                    size="sm"
                    variant="flat"
                    onClick={() => {
                      setCurrComp(item);
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

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Company Name
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  onChange={(e) => setCurrName(e.target.value)}
                  label="Company Name"
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
                    handleUpdateClick(currComp.id);
                    onClose();
                  }}
                >
                  Sign in
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
