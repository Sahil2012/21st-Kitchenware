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
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";

export default function Products() {
  const db = getFirestore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currProduct, setCurrProduct] = useState({ name: "", unit: "", company_name: "" });
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", unit: ""});
  const [companies, setCompanies] = useState([]); // State to store companies
  const [selectedCompany, setSelectedCompany] = useState(""); // State for selected company
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const pages = Math.ceil(products.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return products.slice(start, end);
  }, [page, products]);

  const handleUpdateClick = async (productId, index) => {
    if (currProduct.name.trim() === "") {
      alert("Product name cannot be empty.");
      return;
    }

    try {
      const productDoc = doc(db, "product_table", productId);
      const productSnapshot = await getDoc(productDoc);

      if (productSnapshot.exists()) {
        const productData = productSnapshot.data();
        const { products } = productData;

        const productExists = products.some(
          (p) => p.name === currProduct.name && p.unit === currProduct.unit
        );

        if (productExists) {
          alert("Product with this name and unit already exists.");
          return;
        }

        const updatedProducts = [...products];
        updatedProducts[index] = {
          ...updatedProducts[index],
          name: currProduct.name,
          unit: currProduct.unit,
        };

        await updateDoc(productDoc, { products: updatedProducts });

        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === productId ? { ...p, products: updatedProducts } : p
          )
        );

        alert("Product updated successfully.");
      } else {
        alert("Product document not found.");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong, try updating later.");
    }

    setCurrProduct({ name: "", unit: "", company_name: "" });
  };

  const addProduct = async () => {
    if (
      newProduct.name.trim() === "" ||
      selectedCompany.trim() === ""
    ) {
      alert("Please enter a valid company name, product name, and unit.");
      return;
    }
  
    try {
      // Reference to the document with the ID of selectedCompany
      const companyDocRef = doc(db, "product_table", selectedCompany);
  
      // Get the document with the ID of selectedCompany
      const companyDocSnapshot = await getDoc(companyDocRef);
  
      if (!companyDocSnapshot.exists()) {
        // No document found for the company, so create a new one with selectedCompany as the ID
        await setDoc(companyDocRef, {
          company_name: selectedCompany,
          products: [newProduct],
        });
        setProducts([
          ...products,
          {
            ...newProduct,
            id: selectedCompany, // Document ID is the company name
            index: products.length,
            ind: 0,
            company_name: selectedCompany,
          },
        ]);
      } else {
        // Document found, check for duplicate products
        const productData = companyDocSnapshot.data();
        const existingProducts = productData.products || [];
  
        const productExists = existingProducts.some(
          (p) => p.name === newProduct.name && p.unit === newProduct.unit
        );
  
        if (productExists) {
          alert("Product with this name and unit already exists for this company.");
          return;
        }
  
        // Add the new product to the existing products array
        const updatedProducts = [...existingProducts, newProduct];
  
        // Update the document with the new products array
        await updateDoc(companyDocRef, { products: updatedProducts });
        setProducts([
          ...products,
          {
            ...newProduct,
            id: selectedCompany, // Document ID is the company name
            index: products.length,
            ind: existingProducts.length,
            company_name: selectedCompany,
          },
        ]);
      }
  
      alert("Product added successfully.");
    } catch (error) {
      console.error(error);
      alert("Something went wrong, try adding later.");
    }
  };

  useEffect(() => {
    const q = query(collection(db, "product_table"));
    const unsubscribe = onSnapshot(q, (querySnapShot) => {
      const productData = [];
      let index = 0;
      querySnapShot.forEach((doc) => {
        const { company_name, products } = doc.data();
        products.forEach((product, ind) => {
          productData.push({ ...product, id: doc.id, index, company_name, ind });
          index++;
        });
      });
      setProducts(productData);
    });

    const companyQuery = query(collection(db, "company_table"));
    const unsubscribeCompanies = onSnapshot(companyQuery, (querySnapShot) => {
      const companyData = [];
      querySnapShot.forEach((doc) => {
        companyData.push({ name: doc.data().name, id: doc.id });
      });
      setCompanies(companyData);
    });

    return () => {
      unsubscribe();
      unsubscribeCompanies();
    };
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
        <div className="py-4 flex flex-col sm:flex-row gap-4 items-center w-full max-w-3xl px-2 justify-center">
          <Select
            label="Select Company"
            onChange={(e) => setSelectedCompany(e.target.value)}
            size="sm"
          >
            {companies.map((company) => (
              <SelectItem key={company.name} value={company.name}>
                {company.name}
              </SelectItem>
            ))}
          </Select>

            <Input
              size="sm"
              type="Text"
              label="Product Name"
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <Input
              size="sm"
              type="Text"
              label="Product Unit"
              onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
            />
            <Button color="primary" onClick={addProduct}>
              Add New
            </Button>
          
        </div>
      </div>
      <div className="flex justify-center items-center">
        <Table
          aria-label="Products Table"
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
            <TableColumn>Company Name</TableColumn>
            <TableColumn>Product Name</TableColumn>
            <TableColumn>Product Unit</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody items={items}>
            {(item) => (
              <TableRow key={item.index}>
                <TableCell>{item.company_name}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  <Chip
                    className="capitalize cursor-pointer"
                    color="success"
                    size="sm"
                    variant="flat"
                    onClick={() => {
                      setCurrProduct(item);
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

      <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Product Details
              </ModalHeader>
              <ModalBody>
                <Input
                  readOnly
                  value={currProduct.company_name}
                  label="Company Name"
                  variant="bordered"
                />
                <Input
                  autoFocus
                  onChange={(e) => setCurrProduct({ ...currProduct, name: e.target.value })}
                  value={currProduct.name}
                  label="Product Name"
                  variant="bordered"
                />
                <Input
                  onChange={(e) => setCurrProduct({ ...currProduct, unit: e.target.value })}
                  value={currProduct.unit}
                  label="Product Unit"
                  variant="bordered"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  onPress={async () => {
                    handleUpdateClick(currProduct.id, currProduct.ind);
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
