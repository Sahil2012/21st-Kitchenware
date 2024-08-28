import React, { useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  getKeyValue,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Divider,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { EditIcon } from "./EditIcon";
import { DeleteIcon } from "./DeleteIcon";
import { EyeIcon } from "./EyeIcon";
import { columns } from "./data";
import { PlusIcon } from "../assets/PlusIcon";
import { doc, getFirestore, updateDoc } from "firebase/firestore";

const statusColorMap = {
  Approved: "success",
  Cancelled: "danger",
  Hold: "warning",
  Billed: "secondary",
};

export default function OrderTable({ orders }) {
  const {
    isOpen: isOpen,
    onOpen: onOpen,
    onOpenChange: onOpenChange,
  } = useDisclosure();
  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onOpenChange: onOpenChangeEdit,
  } = useDisclosure();
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const pages = Math.ceil(orders.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return orders.slice(start, end);
  }, [page, orders]);
  const [currOrder, setCurrOrder] = useState({});
  const [editableProducts, setEditableProducts] = useState([]);
  const [originalValues, setOriginalVales] = useState([]);
  const [dis, setDis] = useState(0);
  const [newStatus, setNewStatus] = useState("");

  const handleAddNewProduct = () => {
    setEditableProducts([
      ...editableProducts,
      { name: "", quantity: 0, unit: "pcs" },
    ]);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editableProducts];

    if (
      (!value || value.trim() == "" || value == 0) &&
      index < originalValues.length
    ) {
      console.log(originalValues);
      updatedProducts[index][field] = originalValues[index][field];
    } else {
      if (field === "quantity") {
        updatedProducts[index][field] = Number(value); // Convert value to a number
      } else {
        updatedProducts[index][field] = value;
      }
    }

    setEditableProducts(updatedProducts);
  };

  const handleUpdateClick = async () => {
    const db = getFirestore();
    const orderRef = doc(db, "order_table", currOrder.order_id); // Assuming the document ID is the bill reference number

    // Update products array in Firestore and calculate new order status
    const updatedProducts = editableProducts.filter(
      (product) => product.name && product.name.trim() !== ""
    );

    console.log(updatedProducts);

    // Update the entire order document, including products array and status
    await updateDoc(orderRef, {
      products: updatedProducts,
      status: newStatus,
    });
  };

  const handleDeleteProduct = (index) => {
    const updateProduct = [];
    editableProducts.forEach((product,i) => {
      if(i != index)
        updateProduct.push(product);
    });

    setEditableProducts(updateProduct);
  }

  const renderCell = React.useCallback((cellValue, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex gap-2">
            <Avatar
              isBordered
              color={statusColorMap[cellValue[2]]}
              className="bg-default text-white"
              name={cellValue[0]}
            />
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{cellValue[0]}</p>
              <p className="text-bold text-sm capitalize text-default-400">
                {cellValue[1]}
              </p>
            </div>
          </div>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[cellValue]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="Details">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => {
                  setCurrOrder(cellValue);
                  onOpen();
                }}
              >
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="Edit order" color="success">
              <span
                className="text-lg text-success cursor-pointer active:opacity-50"
                onClick={() => {
                  setCurrOrder(cellValue);
                  setEditableProducts([...cellValue.products]);
                  setOriginalVales([...cellValue.products]);
                  setDis(editableProducts.length);
                  setNewStatus(cellValue.status);
                  onOpenEdit();
                }}
              >
                <EditIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <>
      <Table
        aria-label="Example table with custom cells"
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
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "start" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No rows to display."} items={items}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>
                {renderCell(
                  [item.company_name, item.order_id, item.status],
                  "name"
                )}
              </TableCell>
              <TableCell>
                {renderCell(
                  item.timestamp.toDate().toISOString().split("T")[0],
                  "role"
                )}
              </TableCell>
              <TableCell>{renderCell(item.status, "status")}</TableCell>
              <TableCell>{renderCell(item, "actions")}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        backdrop="blur"
        size="4xl"
        isOpen={isOpen}
        radius="lg"
        scrollBehavior="inside"
        onOpenChange={onOpenChange}
        className={{
          base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
          header: "border-b-[1px] border-[#292f46]",
          footer: "border-t-[1px] border-[#292f46]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex gap-4">
                  Order Details
                  <Chip
                    className="capitalize"
                    color={statusColorMap[currOrder.status]}
                    size="sm"
                    variant="flat"
                  >
                    {currOrder.status}
                  </Chip>
                </div>
              </ModalHeader>
              <Divider />
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between">
                    <div>
                      Order Id : <b>{currOrder.order_id}</b>
                    </div>
                    <div>
                      Date :{" "}
                      {currOrder.timestamp.toDate().toISOString().split("T")[0]}
                    </div>
                  </div>
                  <div>
                    Company Name : <b>{currOrder.company_name}</b>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      Dealer Name : {currOrder.dealer_name},{" "}
                      {currOrder.dealer_city}
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableColumn>Name</TableColumn>
                      <TableColumn>Quantity</TableColumn>
                      <TableColumn>Unit</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {currOrder.products.map((product) => {
                        return (
                          <TableRow key={product.name}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>{product.unit}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </ModalBody>
              <Divider />
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        backdrop="blur"
        size="4xl"
        isOpen={isOpenEdit}
        radius="lg"
        onOpenChange={onOpenChangeEdit}
        scrollBehavior="inside"
        className={{
          base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
          header: "border-b-[1px] border-[#292f46]",
          footer: "border-t-[1px] border-[#292f46]",
        }}
      >
        <ModalContent>
          {(onCloseEdit) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex gap-4">
                  Edit Order Details
                  <Chip
                    className="capitalize"
                    color={statusColorMap[newStatus]}
                    size="sm"
                    variant="flat"
                  >
                    {newStatus}
                  </Chip>
                </div>
              </ModalHeader>
              <Divider />
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between">
                    <div>
                      Order Id : <b>{currOrder.order_id}</b>
                    </div>
                    <div>
                      Date :{" "}
                      {currOrder.timestamp.toDate().toISOString().split("T")[0]}
                    </div>
                  </div>
                  <div>
                    Company Name : <b>{currOrder.company_name}</b>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      Dealer Name : {currOrder.dealer_name},{" "}
                      {currOrder.dealer_city}
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableColumn>Name</TableColumn>
                      <TableColumn>Quantity</TableColumn>
                      <TableColumn>Unit</TableColumn>
                      <TableColumn></TableColumn>
                    </TableHeader>
                    <TableBody>
                      {editableProducts.map((product, index) => {
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                type="Text"
                                placeholder={product.name}
                                label="Name"
                                disabled={index < dis}
                                onChange={(e) =>
                                  handleProductChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="Number"
                                placeholder={product.quantity}
                                label="Quantity"
                                onChange={(e) =>
                                  handleProductChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="Text"
                                placeholder={product.unit}
                                label="Unit"
                                onChange={(e) =>
                                  handleProductChange(
                                    index,
                                    "unit",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip content="Delete Product" color="danger">
                                <span
                                  className="text-lg text-danger cursor-pointer active:opacity-50"
                                  onClick={(e) => handleDeleteProduct(index)}
                                >
                                  <DeleteIcon />
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-between">
                  <Dropdown backdrop="blur">
                    <DropdownTrigger>
                      <Button
                        className="capitalize"
                        color={statusColorMap[newStatus]}
                        size="sm"
                        variant="flat"
                      >
                        {newStatus}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      variant="faded"
                      aria-label="Static Actions"
                      onAction={(key) => setNewStatus(key)}
                    >
                      <DropdownItem key="Pending">Pending</DropdownItem>
                      <DropdownItem key="Hold">Hold</DropdownItem>
                      <DropdownItem key="Approved">Approved</DropdownItem>
                      <DropdownItem key="Billed">Billed</DropdownItem>
                      <DropdownItem key="Cancelled">Cancelled</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Button
                    color="primary"
                    endContent={<PlusIcon />}
                    onClick={handleAddNewProduct}
                  >
                    Add New
                  </Button>
                </div>
              </ModalBody>
              <Divider />
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onCloseEdit();
                  }}
                >
                  Close
                </Button>
                <Button
                  color="success"
                  variant="light"
                  onPress={() => {
                    handleUpdateClick();
                    onCloseEdit();
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
