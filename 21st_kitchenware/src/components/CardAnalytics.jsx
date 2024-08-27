import { Card, CardBody, Divider } from "@nextui-org/react";
import React from "react";

export default function CardAnalytics({
    approved,
    billed,
    cancelled
}) {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 px-2 py-4">
        <Card className="min-w-[200px]">
          <CardBody>
            <p>Approved Orders</p>
            <Divider />
            <div className="flex justify-end">
                <p>{approved} orders</p>
            </div>
          </CardBody>
        </Card>
        <Card className="min-w-[200px]">
          <CardBody>
          <p>Billed Orders</p>
            <Divider />
            <div className="flex justify-end">
                <p>{billed} orders</p>
            </div>
          </CardBody>
        </Card>

        <Card className="min-w-[200px]">
          <CardBody>
          <p>Cancelled Orders</p>
            <Divider />
            <div className="flex justify-end">
                <p>{cancelled} orders</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
