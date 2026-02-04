
import {
  Body,
  Column,
  Container,
  Html,
  Head,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  Heading,
} from "@react-email/components";
import { Order } from "@/types";
import { formatCurrency } from "@/lib/utils";
import dotenv from 'dotenv';
dotenv.config();


const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

const PurchaseReceipt = ({ order }: { order: Order }) => {
  return (
    <Html>
      <Preview>Ver orden de compra</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Recibo de compra</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Order id
                  </Text>
                  <Text className="mt-0 mr-4 ">{order.id.toString()}</Text>
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Fecha de compra
                  </Text>
                  <Text className="mt-0 mr-4 ">
                    {dateFormatter.format(order.createdAt)}
                  </Text>
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Price paid
                  </Text>
                  <Text className="mt-0 mr-4 ">
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
                {order.orderitems.map((item)=>(
                    <Row key={item.productId} className="mt-8">
                        <Column className="w-20">
                            <Img src={item.image.startsWith('/') ? `${process.env.NEXT_PUBLIC_SERVER_URL} ${item.image}`: item.image } width='80' alt={item.name} className="rounded"/>
                        </Column>
                        <Column className="align-top">{item.name} x{item.qty}</Column>
                        <Column className='align-top'>{formatCurrency(Number(item.price) * item.qty)}</Column>
                    </Row>
                ))}
                {[
                    {name: 'Items', price: order.itemsPrice},
                    {name: 'Shipping', price: order.shippingPrice},
                    {name: 'Total price', price: order.totalPrice},
                    
                ].map(({name, price})=>(
                    <Row key={name} className="py-1">
                        <Column align='right'>{name}: </Column>
                        <Column align="right" width={70} className="align-top">
                              <Text className="m-0">{formatCurrency(price)}</Text>
                        </Column>
                    </Row>
                ))  }
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
export default PurchaseReceipt;


type OrderInformationProps= {
  order: Order
}

// export default function PurchaseReceipt ({ order }: OrderInformationProps) {
//   return (
//     <Html>
//       <Preview>Ver orden de compra</Preview>
//       <Tailwind>
//         <Head />
//         <Body className="font-sans bg-white">
//           <Container className="max-w-xl">
//             <Heading>Recibo de compra</Heading>
//             <Section>
//               <Row>
//                 <Column>
//                   <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
//                     Order id
//                   </Text>
//                   <Text className="mt-0 mr-4 ">{order.id.toString()}</Text>
//                 </Column>
//                 <Column>
//                   <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
//                     Fecha de compra
//                   </Text>
//                   <Text className="mt-0 mr-4 ">
//                     {dateFormatter.format(order.createdAt)}
//                   </Text>
//                 </Column>
//                 <Column>
//                   <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
//                     Price paid
//                   </Text>
//                   <Text className="mt-0 mr-4 ">
//                     {formatCurrency(order.totalPrice)}
//                   </Text>
//                 </Column>
//               </Row>
//             </Section>
//             <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
//                 {order.orderitems.map((item)=>(
//                     <Row key={item.productId} className="mt-8">
//                         <Column className="w-20">
//                             <Img src={item.image.startsWith('/') ? `${process.env.NEXT_PUBLIC_SERVER_URL} ${item.image}`: item.image } width='80' alt={item.name} className="rounded"/>
//                         </Column>
//                         <Column className="align-top">{item.name} x{item.qty}</Column>
//                         <Column className='align-top'>{formatCurrency(item.price)}</Column>
//                     </Row>
//                 ))}
//                 {[
//                     {name: 'Items', price: order.itemsPrice},
//                     {name: 'Shipping', price: order.shippingPrice},
//                     {name: 'Total price', price: order.totalPrice},
                    
//                 ].map(({name, price})=>(
//                     <Row key={name} className="py-1">
//                         <Column align='right'>{name}: </Column>
//                         <Column align="right" width={70} className="align-top">
//                               <Text className="m-0">{formatCurrency(price)}</Text>
//                         </Column>
//                     </Row>
//                 ))  }
//             </Section>
//           </Container>
//         </Body>
//       </Tailwind>
//     </Html>
//   );
// };